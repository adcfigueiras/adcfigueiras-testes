# APP ADC Figueiras — ambiente de pré-produção

**Estado:** aplicação de testes publicada na `main` de `adcfigueiras/adcfigueiras-testes`; validação funcional em curso.  
**Produção:** https://adcfigueiras.github.io/ — projeto Supabase `kfihltycbnambszmefqa` (**NÃO ALTERAR NA FASE DE TESTES**).

## Estado confirmado em 21/10/2026

- **Projeto Supabase separado criado:** [ADC Figueiras - Testes](https://supabase.com/dashboard/project/exqqcpxvegqkjwenriik) (`exqqcpxvegqkjwenriik`, `eu-west-3`), na organização Free; custo adicional apresentado de **0 $/mês**. Ocupa a segunda vaga gratuita enquanto estiver ativo.
- **Produção intacta:** `kfihltycbnambszmefqa`. Nenhum dado real foi exportado/importado para testes.
- **Estrutura equivalente criada por introspeção somente do esquema** da produção: 27 tabelas, 72 políticas RLS, 20 funções e 26 triggers; sem dados reais. O SQL estrutural foi aplicado apenas em testes.
- **Quatro migrações aplicadas no projeto de testes:** plano alimentar, aceitação dos Termos, rate limits e convocatórias públicas. As duas novas tabelas elevam o total a 29.
- **Testes de autorização executados com identidades fictícias em transação revertida:** publicação da convocatória, preferências de notificação, duplicados, visibilidade de convocados/não convocados, acesso a Termos, nutrição e rate limit. Todos passaram. As identidades artificiais não ficaram na base de dados.
- **Dados de demonstração permanentes e fictícios:** quatro jogadores, uma época e três jogos. O ficheiro `tests/sql/staging-demo-data.sql` reproduz os dados sem copiar contas ou emails.
- **Testes automatizados aprovados:** [GitHub Actions de segurança e migrações](https://github.com/adcfigueiras/adcfigueiras.github.io/actions/runs/39626474586).
- **Pacote de app de pré-produção produzido:** [GitHub Actions — pré-produção](https://github.com/adcfigueiras/adcfigueiras.github.io/actions/runs/39626474672), artefacto `adc-figueiras-preproducao` (expira em 28/10/2026). Esta versão utiliza a URL e a chave **pública** do projeto de testes; nunca uma chave privada ou a base real. O push fica desativado.
- **Site de testes publicado e verificado:** https://adcfigueiras.github.io/adcfigueiras-testes/. O repositório de produção não foi alterado.
- **Ainda pendentes:** contas de teste autenticadas por função, ensaios completos em Android/iPhone, configuração e testes separados das Edge Functions, revisão final das páginas legais, backups reais exportados pelo Admin e verificações finais antes da publicação.


## Atualização de validação — 21/10/2026

### Confirmado no navegador e pelo utilizador
- GitHub Pages de testes ativo; Site URL e Redirect URLs configurados pelo utilizador.
- Registo, confirmação de email e entrada da conta de testes concluídos.
- Recuperação de palavra-passe concluída, com entrada usando a nova palavra-passe.
- Convocatória publicada visível ao visitante; convocatória não publicada oculta.
- Pesagens fictícias guardadas, preservadas após atualização e presentes na cronologia única da ficha do jogador. Secção de pesagens oculta ao visitante.
- Calendário no telemóvel: deslocação horizontal, abertura de detalhes e legibilidade confirmadas pelo utilizador. Sistema operativo do dispositivo não identificado; não equivale a validação independente em Android e iPhone.
- Corrigida a seleção da época local de exemplo que ocultava os dados online: commits `519bf0a7` e `305277ab`. Verificada no navegador a convocatória de três jogadores após publicação.

### Verificação direta de permissões na base de dados
Executada exclusivamente em `exqqcpxvegqkjwenriik`, dentro de transação revertida. Nenhuma alteração de funções ficou guardada; administrador confirmado após rollback.

| Acesso simulado | Pesagens de jogo visíveis | Configuração do plano alimentar | Exportação de administrador |
| --- | --- | --- | --- |
| Autenticado sem funções | 0 | 0 | Bloqueada |
| Sócio | 0 | 0 | Bloqueada |
| Jogador | 2 | 0 | Bloqueada |
| Capitão | 2 | 0 | Bloqueada |
| Staff | 2 | 1 | Bloqueada |
| Administrador | 2 | 1 | Não chamada neste teste |

Os números representam linhas existentes visíveis, não permissões de escrita. O caso sem funções foi simulado com um UUID sem funções, sem criar uma conta Auth. Treinos, presenças, pesagens de treino e multas não continham dados; resultados vazios nessas tabelas não comprovam isolamento com dados. Permanecem necessários testes de escrita e testes completos com contas separadas.

### Avisos do analisador Supabase
- Todas as 29 tabelas públicas têm RLS ativo.
- Onze funções públicas `SECURITY DEFINER` são executáveis por utilizadores autenticados. A leitura do código confirmou verificações de função/identidade; o bloqueio da exportação administrativa foi testado nos cinco perfis não administradores acima. Isto não representa um teste dinâmico completo de todas as funções. [Explicação do aviso](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- `private.user_action_rate_limits` tem RLS sem políticas: tabela interna, sem acesso direto por desenho. [Explicação](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Proteção contra palavras-passe comprometidas desativada no projeto de testes; configuração não alterada. [Documentação](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### Próximos passos
- Retomar o registo da segunda conta após repor a quota de email. Os registos de Auth confirmaram `over_email_send_rate_limit`; o serviço integrado limita o projeto a dois emails por hora. Não foi desativada a confirmação de email nem alterada a quota.
- Testar conta registada e sócio no navegador, depois restantes funções, incluindo tentativas de escrita não autorizadas.
- Completar ensaios Android/iPhone e validação de notificações em ambiente controlado. O push permanece desativado no site de testes.
- Produção só pode ser alterada após autorização expressa.

## Testes automáticos complementares em PostgreSQL descartável

A workflow `security-checks.yml` dispõe também de testes em **PostgreSQL 17 descartável** do GitHub Actions, com `tests/sql/fixture.sql` e `tests/sql/assertions.sql`. Os ficheiros usam apenas utilizadores e jogos fictícios. Tentam aplicar as quatro migrações e verificar convocatórias, notificações, Termos, configurações privadas e limites de pedidos.

**Limitação:** o PostgreSQL descartável contém um **esquema mínimo de teste**, não uma cópia exata do Supabase (Auth, API, Edge Functions e todas as políticas reais). Um teste aprovado não substitui ensaios integrados antes do lançamento.

O ambiente local de trabalho disponível não tem Docker, pelo que o teste PostgreSQL utiliza um runner temporário do GitHub Actions. **Não ocupa projetos nem quotas gratuitas do Supabase.**

## Objetivo

Validar as novas funcionalidades e alterações de segurança num **projeto Supabase separado**, com **contas e dados fictícios**. A app de testes só deve apontar ao projeto de testes, nunca à base de dados real.

### 1–4. Configuração criada

O projeto já foi criado e as migrações validadas nele. A chave usada no navegador é do tipo `sb_publishable_` e é **pública por definição**. A workflow `preproduction-package.yml` gera um artefacto de pré-produção automaticamente, sem utilizar segredos, e o script `scripts/build-staging.mjs` recusa apontar para a URL de produção.

**Não copiar dados reais de atletas, utilizadores ou pesagens para o projeto de testes.** Para repetir o conteúdo de demonstração, usar exclusivamente `tests/sql/staging-demo-data.sql`.

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
