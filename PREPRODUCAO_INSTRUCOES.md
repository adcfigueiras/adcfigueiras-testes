# APP ADC Figueiras — ambiente de pré-produção

**Estado:** preparação técnica no ramo `feature/public-member-match-center`.  
**Produção:** https://adcfigueiras.github.io/ — projeto Supabase `kfihltycbnambszmefqa` (**NÃO ALTERAR NA FASE DE TESTES**).

## Teste de migrações PostgreSQL sem segundo projeto Supabase

A workflow `security-checks.yml` dispõe também de testes em **PostgreSQL 17 descartável** do GitHub Actions, com `tests/sql/fixture.sql` e `tests/sql/assertions.sql`. Os ficheiros usam apenas utilizadores e jogos fictícios. Tentam aplicar as quatro migrações e verificar convocatórias, notificações, Termos, configurações privadas e limites de pedidos.

**Limitação:** o PostgreSQL descartável contém um **esquema mínimo de teste**, não uma cópia exata do Supabase (Auth, API, Edge Functions e todas as políticas reais). Um teste aprovado não substitui ensaios integrados antes do lançamento.

O ambiente local de trabalho disponível não tem Docker, pelo que o teste PostgreSQL utiliza um runner temporário do GitHub Actions. **Não ocupa projetos nem quotas gratuitas do Supabase.**

## Objetivo

Validar as novas funcionalidades e alterações de segurança num **projeto Supabase separado**, com **contas e dados fictícios**. A app de testes só deve apontar ao projeto de testes, nunca à base de dados real.

### 1. Confirmar organização e custo

O único espaço Supabase disponível na ligação atual chama-se **ADC Figueiras**. A criação de um segundo projeto, sugerido com o nome `ADC Figueiras - Testes`, tem de ser confirmada pelo responsável e pelo sistema de custos Supabase; não criar automaticamente sem essa confirmação.

Usar, se permitido, a mesma região da produção: **eu-west-3**. Não copiar utilizadores, emails pessoais, pesagens ou backups reais para testes.

### 2. Criar projeto Supabase de testes

- Depois de obter autorização de organização/custo, criar projeto `ADC Figueiras - Testes`.
- Fazer backup/exportação privada do estado da produção **antes** de alterar a aplicação pública.
- Preparar a estrutura inicial da base de dados por migrações de esquema, **sem dados pessoais de produção**. Um projeto Supabase novo não contém automaticamente as 27 tabelas, políticas e funções do projeto real.
- Para recuperar a estrutura existente, seguir a documentação `Supabase CLI > supabase db pull` / `supabase db push`, com credenciais num ambiente local seguro. Nunca colocar connection strings de BD nem passwords no GitHub.
- Inserir dados fictícios: época, equipas, partidas agendadas e concluídas, 3 jogadores falsos, sessões de treino e diferentes funções para utilizadores de teste.

### 3. Aplicar as quatro migrações primeiro em testes

A execução requer revisão das dependências e políticas já existentes:
- `SUPABASE_MIGRATION_NUTRITION_SETTINGS.sql`
- `SUPABASE_MIGRATION_TERMS_ACCEPTANCES.sql`
- `SUPABASE_MIGRATION_CALLUP_PUBLIC.sql`
- `SUPABASE_MIGRATION_SECURITY_RATE_LIMIT.sql`

As Edge Functions `push-test` e `send-push-queue` também devem ser testadas no projeto novo. O envio push fica **desativado no bundle de testes até existir uma chave VAPID exclusiva do ambiente**.

### 4. Ligar o site de testes ao projeto novo

O script `scripts/build-staging.mjs` exige variáveis da **pré-produção** e recusa a URL do backend real:

```text
STAGING_SUPABASE_URL=https://<projeto-de-testes>.supabase.co
STAGING_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<chave-publica-do-projeto-de-testes>
STAGING_VAPID_PUBLIC_KEY=                 # opcional; vazio => push desativado
```

Em GitHub, podem ser configuradas como **Actions > Variables** do repositório (são valores públicos; não usar chaves privadas!). A workflow `preproduction-package.yml` gera automaticamente o artefacto **adc-figueiras-preproducao**, retido sete dias. Até à configuração das variáveis, o job é ignorado, por segurança.

O pacote é um site estático, não um servidor. Deve ser colocado num domínio de teste separado antes de testar em dispositivos. **Não publicar o pacote sobre `adcfigueiras.github.io` nem no branch `main`.** O script também separa a chave de armazenamento e a cache da PWA.

### 5. Testar

- Executar `node tests/security-smoke.mjs` e `node tests/staging-build.mjs` (também no GitHub Actions).
- Entrar com perfis de teste: sem conta, sócio, jogador, capitão, staff e admin.
- Confirmar que públicos e sócios não têm acesso a pesagens, lesões, multas, presenças nem dados privados por URL/API.
- Confirmar que jogadores podem consultar as pesagens internas de todo o plantel, conforme decisão da associação.
- Criar uma convocatória e confirmar publicação imediata, notificação geral e ausência de duplicados.
- Testar recuperação de password, criação de conta, aceitação de Termos, logout/login, troca de utilizador, limpeza da cache, calendário móvel e época histórica.
- Confirmar que o push **permanece registado após logout**, conforme definido para a aplicação; só se desativa pelo botão explícito ou pelo sistema.
- Ensaiar os limites de pedidos sem afetar utilizadores reais.
- Inspecionar a consola do browser: violações CSP, requests externos, erros Auth/RLS, recursos CDN.

### 6. Promover para produção

Apenas com testes automáticos verdes, verificação manual, backup verificado, direitos de imagem e documentos legais validados:

1. Aprovar a ordem de aplicação das migrações no **Supabase de produção**, com estratégia de recuperação.
2. Aplicar migrações e verificar Auth/RLS e fila de notificações.
3. Publicar a atualização do GitHub Pages com versão/cache novas.
4. Validar a app em telemóvel e computador com contas existentes.
5. Reavaliar os avisos de segurança do Supabase e monitorizar erros.

**Não existe autorização implícita para copiar dados reais nem para criar despesas.**
