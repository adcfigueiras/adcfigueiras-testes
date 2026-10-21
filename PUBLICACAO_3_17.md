# Versão candidata 3.17.0 — aguardando autorização

Preparada em 21/10/2026 a partir da versão de testes validada. Nenhuma migração, Edge Function ou frontend foi publicada em produção.

## Referências

- Produção de referência: d02e60cf4a248eb28310dc307202adfccceccb01.
- Testes de referência: 154fc569c3ec65ad15ca77893f40d11da97afb3f.
- Backup privado entregue: ADC_Figueiras_Copia_2026-10-21.zip. É uma exportação lógica da aplicação, não um backup integral da plataforma. Ver limites e recuperação no LEIA-ME.
- Utilizador confirmou que não existe modelo alimentar guardado; iniciar tabela privada vazia/desativada.

## Conteúdo

App 3.17.0 com Match Center/Plantel públicos, convocatórias publicadas e aviso geral, calendário móvel, proteção de cache/formulários, documentos legais e aceitação dos Termos.
Configurações de Supabase, VAPID, chaves de armazenamento, manifesto e calendário/equipas preservadas da produção. Subscrições push não são removidas ao sair. Clique de push oficial exclui janelas de testes; limpeza de cache exclui testes e outros sites/apps.
As duas Edge Functions correspondem exatamente às versões 2 recuperadas do ambiente de testes que entregou os avisos validados.

## Ordem de execução após autorização

1. Reconfirmar o HEAD de produção e eventuais alterações desde o backup; atualizar a cópia de dados se necessário. Não sobrescrever alterações concorrentes.
2. Aplicar ao projeto kfihltycbnambszmefqa, por ordem, os ficheiros SUPABASE_MIGRATION_NUTRITION_SETTINGS.sql, SUPABASE_MIGRATION_TERMS_ACCEPTANCES.sql, SUPABASE_MIGRATION_SECURITY_RATE_LIMIT.sql e SUPABASE_MIGRATION_CALLUP_PUBLIC.sql. Não executar fixtures ou dados de testes.
3. Verificar novas tabelas/políticas/RPCs e ausência de perda de registos. As migrações não recriam contas nem copiam dados fictícios.
4. Atualizar push-test (verify_jwt=true) e send-push-queue (verify_jwt=false; autenticação própria por segredo). Manter segredos, chaves e cron existentes em produção.
5. Copiar para o repositório oficial os ficheiros de aplicação verificados, os documentos e os ficheiros de manutenção necessários. Usar atualização de referência com proteção contra mudança de HEAD. Não copiar o backup, dados exportados ou segredos.
6. Confirmar conclusão do Pages e recursos v3.17.0. Verificar carregamento, dados oficiais e sessão. Não disparar avisos gerais reais apenas para testes sem autorização.

## Validação desta candidata

- Sintaxe JavaScript: passou.
- Testes estáticos de segurança e privacidade: passaram.
- Gerador isolado de pré-produção: passou.
- Chaves públicas/Supabase/armazenamento oficiais: iguais às referências de produção.
- Calendário e equipas: ficheiros idênticos à produção.
- Sem referência ao backend de testes ou jogadores fictícios no frontend.
- Simulação do service worker: conserva caches de testes e não foca a janela de testes ao clicar no push oficial.
- Migrações já validadas no ambiente de testes; não executadas novamente em produção.
- Não foi feito ensaio de restauração integral nem nova matriz completa Android/iPhone. Testes do utilizador constam da revisão anterior; a candidata ainda não foi exercitada contra produção.

## Reversão

Restaurar o frontend do commit de referência e as funções anteriores guardadas no backup (push-test v2 e send-push-queue v1 de produção). Reverter apenas funções/políticas afetadas, conservando novas tabelas/dados. Reposição integral dos dados é último recurso e apaga alterações posteriores à captura; requer revisão técnica do esquema compatível.
