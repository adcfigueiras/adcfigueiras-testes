-- AUDITORIA DE SEGURANÇA ADC FIGUEIRAS — limitador atómico por utilizador
-- PREPARAR EM PROJETO DE TESTE PRIMEIRO. NÃO executar diretamente em produção.
-- O Supabase Auth já limita login/signup/reset no próprio serviço:
-- confirmar quotas em Authentication > Rate Limits; isto protege endpoints próprios.

begin;

create table if not exists private.user_action_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  action_name text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key(user_id, action_name)
);
alter table private.user_action_rate_limits enable row level security;
revoke all on private.user_action_rate_limits from public, anon, authenticated;

create or replace function private.claim_action_rate_limit(
  p_action text,
  p_window_seconds integer,
  p_max_requests integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
  v_now timestamptz := clock_timestamp();
begin
  -- Não aceitar IDs de outros utilizadores fornecidos pelo cliente.
  if v_user_id is null then return false; end if;
  if p_action not in ('push_test','member_request','profile_update','notification_create') then
    raise exception 'Ação inválida.';
  end if;
  if p_window_seconds < 10 or p_window_seconds > 86400
     or p_max_requests < 1 or p_max_requests > 200 then
    raise exception 'Limite inválido.';
  end if;

  insert into private.user_action_rate_limits as ratelimit
    (user_id,action_name,window_started_at,request_count)
  values (v_user_id,p_action,v_now,1)
  on conflict (user_id,action_name)
  do update set
    window_started_at = case
      when ratelimit.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then v_now
      else ratelimit.window_started_at end,
    request_count = case
      when ratelimit.window_started_at <= v_now - make_interval(secs => p_window_seconds)
        then 1
      else ratelimit.request_count + 1 end
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$function$;

revoke all on function private.claim_action_rate_limit(text,integer,integer) from public,anon,authenticated;

-- Somente esta RPC com parâmetros fixos pode ser usada no browser.
-- O cliente não escolhe o utilizador nem o intervalo.
create or replace function public.claim_push_test_slot()
returns boolean
language plpgsql security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null then
    raise exception 'Sessão inválida.';
  end if;
  return private.claim_action_rate_limit('push_test',300,3);
end;
$function$;

revoke all on function public.claim_push_test_slot() from public,anon;
grant execute on function public.claim_push_test_slot() to authenticated;

commit;

-- Testes obrigatórios:
-- 1. Um usuário de teste pode obter 3 autorizações em 5 minutos; a 4.ª é false.
-- 2. Outra conta tem contador independente e não consegue ler/escrever a tabela.
-- 3. Anon não executa RPC. A contagem reseta passados 5 minutos.
-- 4. Testar concorrência (UPSERT atómico) e a Edge Function push-test.
-- 5. Definir limpeza de contadores antigos se necessário; janela de 5 min, 1 row/user.
