# ADC Figueiras — Auditoria legal e privacidade pré-lançamento

Data da revisão inicial: 21/10/2026. Âmbito: código estático no branch `feature/public-member-match-center`, configuração de tabelas/advisors Supabase, app alojada no GitHub Pages. **Este documento é uma auditoria técnica preliminar, não parecer jurídico nem certificação.**

## Documentos e funcionalidades preparadas apenas na ramificação
- `termos.html`: Termos e Condições — minuta, com dados do responsável por confirmar.
- `privacidade.html`: Política de Privacidade — minuta alinhada com os dados e serviços identificados.
- `cookies.html`: Política de Cookies e Armazenamento Local — minuta, sem banner desnecessário.
- `legal.css`: estilos responsivos/acessíveis.
- `SUPABASE_MIGRATION_NUTRITION_SETTINGS.sql`: tabela privada de template nutricional e referência de peso, não aplicada.
- `supabase/functions/send-push-queue/index.ts`: atualização preparada para impedir divulgação de pesos por notificações push, ainda não implementada no serviço de produção.
- Links no ecrã de entrada, barra lateral e secção Privacidade; checkbox obrigatório no registo. Pedido de registo envia `terms_accepted` e `terms_version`. A migração `SUPABASE_MIGRATION_TERMS_ACCEPTANCES.sql` prepara gravação no servidor, **ainda não aplicada**.
- Alt text revisto nos emblemas do HTML estático e no destaque do próximo jogo; emblemas de equipas dinâmicos já tinham alt com o nome da equipa.

## PRIORIDADE 0 — Antes da publicação pública

1. **Confirmar entidade responsável**: o desenvolvedor confirmou que está a construir a app **para a associação ADC Figueiras**, não como produto pessoal. Em princípio, a associação será responsável pelo tratamento se decidir finalidades e meios essenciais. Identificação fornecida para os documentos: **Associação Desportiva e Cultural de Figueiras — NIPC 501621245 — sede: Rua ADC Figueiras, n.º 217, 4620-204 Figueiras, Lousada**. Contactos oficiais fornecidos pelo responsável pelo projeto: **telefone 916 299 909** e **email adcf2015@gmail.com**. Este email passa a ser indicado para pedidos RGPD. Confirmar quem, na associação, responde efetivamente aos pedidos e se existe DPO/EPD. Não usar dados pessoais do programador por defeito.
2. **Governança do desenvolvedor**: confirmar se o programador atua sob autoridade direta da associação (ex.: membro/colaborador autorizado) ou como prestador externo com acesso a dados pessoais. No segundo caso, avaliar acordo de subcontratação conforme art. 28.º RGPD, instruções documentadas, confidencialidade, controlo de acessos, devolução/eliminação de dados ao terminar as funções e utilização de fornecedores. O título de «programador» isoladamente não determina a qualificação.
3. **Dados de saúde / pesagens**: avaliar se peso e estados de lesão constituem dados de saúde no contexto, determinar fundamento jurídico do art. 6.º e condição do art. 9.º RGPD, efetuar teste de necessidade/minimização e, se aplicável, avaliação de impacto (AIPD). **Decisão funcional do clube (21/10/2026): manter a consulta das pesagens de todos os atletas por jogadores, capitães, equipa técnica e administração; visitantes e sócios sem função interna continuam excluídos.** Esta decisão não dispensa uma avaliação de necessidade, proporcionalidade, fundamento jurídico e, quando aplicável, condição do art. 9.º do RGPD, nem a informação clara a todos os atletas sobre quem vê os seus dados. Uma declaração genérica nos Termos não legitima a divulgação.
4. **Menores**: foi confirmado em 21/10/2026 que **o plantel atual não inclui atletas menores de 18 anos**. Assim, não são necessárias autorizações parentais especificamente para os jogadores atualmente inscritos. A informação não demonstra que todos os utilizadores da app sejam adultos nem dispensa rever a situação sempre que entrem novos atletas ou utilizadores menores. Antes de permitir registo, imagens ou tratamento de dados de um menor, avaliar requisitos de informação, fundamento jurídico e eventual intervenção do representante legal.
5. **Segurança localStorage/cache**: na ramificação, a persistência passou a usar um snapshot público, os dados históricos em cache são sanitizados e os dados internos em memória são limpos ao mudar de conta. Testes com dados fictícios passaram, mas **falta validação em navegador/dispositivos** (logout, outras contas, PWA offline, arquivo e backups). **Fazer cópia de segurança e testar restauração antes de atualizar**, porque o novo formato deixa de conservar dados internos localmente.
6. **Autorizações de imagem e propriedade intelectual**: existem emblemas carregados remotamente de `zerozero.pt` e `afporto.pt`. Confirmar autorização/licenças de reprodução e redistribuição; preferir ficheiros autorizados e localmente alojados. Não assumir que a imagem estar num site a torna livre. O responsável pelo projeto confirmou em 21/10/2026 que as fotografias dos atletas são tiradas por alguém ligado ao clube; **confirmar documentalmente com o autor/fotógrafo o direito de reprodução/publicação e com os atletas o fundamento jurídico adequado para divulgação das respetivas imagens**, incluindo eventual publicação em redes sociais. Confirmar também direitos de emblemas de outros clubes e imagens de patrocinadores.
7. **Termos e consentimento**: a checkbox de aceitação já existe e o pedido de registo inclui a versão aceite; a migração de registo em servidor está preparada mas não aplicada. Rever em ambiente de teste, incluindo provas mínimas, versão do documento, retenção e direitos. Não usar essa checkbox como consentimento para dados de saúde ou divulgação de imagens; quando exigido, obter autorização distinta.
8. **Completar Política de Privacidade**: finalidades e bases jurídicas concretas por categoria, destinatários, retenções, contacto RGPD, direitos, destinatários fora do EEE, contratos DPA com prestadores, transferências, menores e resposta a incidentes. Definir política de eliminação de contas e retenção de backups.
9. **Testes funcionais e de segurança em produção de teste**: perfis anon/público, membro, jogador, capitão, staff, admin; tentar pedidos diretos à API RLS; confirmar que fotos, pesos, assiduidade, estados de lesão e multas não são acessíveis indevidamente; verificar dados locais após logout.

10. **Plano alimentar pré-jogo**: a configuração interna deixou de ser incluída na cache persistente da próxima versão. Estão preparados a tabela privada `SUPABASE_MIGRATION_NUTRITION_SETTINGS.sql` e o código de leitura/gravação pela equipa técnica/admin. **Sem aplicar a migração, a gravação do template fica indisponível na versão em desenvolvimento**; preservar o template antigo e repô-lo depois da migração. O push do tipo `nutrition` está preparado para mostrar apenas um aviso genérico; é necessário validar e implementar a nova versão da Edge Function `send-push-queue` na publicação.

### Resultados adicionais — 21/10/2026

- **27 tabelas em `public`**: todas têm RLS ativada; não foram encontradas vistas públicas.
- **Acesso `anon`**: sem privilégio SELECT nas tabelas `weigh_ins`, `match_weigh_ins`, `training_attendance`, `fines`, `player_availability`, `profiles`, `push_subscriptions` e outras tabelas internas. A tentativa de leitura como `anon` em `weigh_ins` foi rejeitada pelo Postgres. Ainda faltam testes equivalentes com contas registadas nas várias funções.
- **Convocatórias públicas**: a migração preparada foi revista para permitir leitura antes do jogo apenas de `match_players.called_up=true`, após `callup_published_at`. Não foi aplicada.
- **Notificações de nutrição**: foi identificada a inclusão de pesos no texto completo de algumas notificações; a Edge Function preparada no GitHub substituirá **só no push** o conteúdo por uma mensagem genérica. O corpo individual continuará na caixa privada de notificações do destinatário. **A Edge Function em produção não foi alterada.**
- **Configuração interna**: template nutricional e preferências de peso passam a ser obtidos através de tabela privada após a sua migração. Não há alteração de produção até testes de autorização e preservação de backups.

### Pré-produção independente — atualização de 21/10/2026

- Criado o projeto **ADC Figueiras - Testes** (`exqqcpxvegqkjwenriik`) na organização Free; custo adicional indicado de 0 $/mês, utilizando a segunda vaga gratuita.
- Recriada exclusivamente a **estrutura técnica** das 27 tabelas de produção, com 72 políticas RLS, 20 funções e 26 triggers, sem copiar contas, emails, fotografias ou pesagens reais. As quatro migrações pendentes passaram no projeto de testes, que dispõe agora de 29 tabelas.
- Teste real em transação revertida com identidades fictícias: acesso antes/depois da publicação da convocatória, sócio sem acesso ao plano interno, registo de Termos, destinatários e preferências de notificação, ausência de duplicados e rate limit. Todas as asserções passaram e a transação foi revertida.
- Populados somente **quatro jogadores fictícios e três jogos inventados**; `tests/sql/staging-demo-data.sql` permite reconstruí-los. Nenhuma conta de login real ou pessoal foi copiada.
- GitHub Actions: [segurança e migrações aprovadas](https://github.com/adcfigueiras/adcfigueiras.github.io/actions/runs/39626474586) e [pacote de app de testes gerado](https://github.com/adcfigueiras/adcfigueiras.github.io/actions/runs/39626474672). O bundle liga-se apenas ao Supabase de testes, com chave pública e push desativado.
- **Ainda pendente** um endereço público **separado** para testar o frontend, contas fictícias com login em todas as funções, ensaios Android/iPhone, Edge Functions e validação jurídica das políticas. O ramo `main` e o Supabase de produção continuam sem alterações.
- Security Advisor em pré-produção: 11 avisos de funções `SECURITY DEFINER` executáveis por autenticados (incluindo duas novas RPCs), a analisar individualmente; não existem indícios de que todas representem vulnerabilidades. Em produção persistem os nove avisos anteriores e o alerta de proteção contra passwords comprometidas desativada.

## PRIORIDADE 1 — Melhorias técnicas

- **Supabase security advisors** (21/10/2026): aviso de **9 funções SECURITY DEFINER com EXECUTE para utilizadores autenticados** e **proteção de palavras-passe comprometidas desativada**. As funções podem ser intencionais, mas cada uma exige revisão do código, `auth.uid()`, verificações de função, search_path, GRANT e abuso. Não remover indiscriminadamente funções necessárias. Ver documentação: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable e https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .
- **Dependências de terceiros**: `index.html` carrega `@supabase/supabase-js@2` de CDN (tag de versão maior, não versão exata). Fixar versão testada e considerar integridade SRI ou alojamento local, depois de validar compatibilidade. Bibliotecas de CDN recebem pedidos de IP/user-agent e podem criar dependência de disponibilidade.
- **Tracking/cookies**: não foram detetados no código analisado scripts do Google Analytics, Meta Pixel, Hotjar, Clarity ou iframes. Existem localStorage, sessionStorage, Cache API, autenticação e serviços de push. Verificar **na prática, antes de lançar**, cookies/requests de terceiros em janela privada, com login, logout e push. Se surgirem tecnologias não estritamente necessárias, obter consentimento prévio e possibilidade de recusa/revogação antes de as ativar.
- **Embed de terceiros**: não foram identificados `iframe` / `embed` / `object` na aplicação analisada. Há imagens remotas e biblioteca externa.
- **Alt text**: revistos os `<img>` conhecidos; manter imagens decorativas com `alt=""`, imagens informativas com descrição funcional curta, e testar leitores de ecrã, contraste, focus e navegação por teclado.
- **Notificações**: a subscrição é voluntária; testar cancelamento por dispositivo, preferências e tratamento dos identificadores push.
- **URLs e política**: os links legais foram adicionados na ramificação mas os HTML estão com `noindex,nofollow` enquanto forem minutas. Remover a etiqueta após aprovação jurídica e verificação do responsável.
- **CSP/headers**: verificar políticas HTTP de segurança possíveis com GitHub Pages (alguns cabeçalhos não são personalizáveis). Política CSP `meta` pode ajudar parcialmente, mas requer auditoria de scripts inline e domínios antes de introduzir bloqueios.
- **Incidentes**: planear backups protegidos, controlo de acessos, procedimento para violação de dados e comunicação às autoridades/titulares quando obrigatória.

## Refund policy / vendas / livro de reclamações

A versão verificada é uma plataforma gratuita sem pagamentos integrados. Uma política de reembolsos e regras de livre resolução de contratos pagos **não se justificam neste momento**; reavaliar se forem adicionadas quotas, bilhetes, merchandising ou serviços pagos dentro da app. Obrigações como Livro de Reclamações Eletrónico dependem da atividade comercial efetiva e de enquadramento setorial — não presumir aplicabilidade automática apenas pela disponibilização de uma PWA.

## Informação prestada nos formulários

- Registo: Termos com checkbox próprio + link de informação RGPD, sem pré-seleção.
- Login: notificação de privacidade disponível no rodapé.
- Pedido de número de sócio e edição de perfil: rever finalidade, retenção e contactos na política.
- Convocatórias, pesagens, estado físico, multas: não substituir por consentimento genérico da conta; definir regras próprias para quem fornece e consulta os dados.
- Fotografias e materiais de terceiros: usar autorização específica e documentada quando juridicamente necessária; manter registo de quem autorizou, em que termos e como retirar consentimento quando essa for a base escolhida.

## Bibliografia essencial
- RGPD: https://eur-lex.europa.eu/eli/reg/2016/679/pt
- Lei 58/2019: https://diariodarepublica.pt/dr/detalhe/lei/58-2019-123815982
- Lei 46/2012, art.º 5.º: https://diariodarepublica.pt/dr/detalhe/lei/46-2012-174793
- CNPD — consentimento: https://www.cnpd.pt/organizacoes/areas-tematicas/consentimento/
- CNPD — AIPD: https://www.cnpd.pt/organizacoes/outras-obrigacoes/avaliacao-de-impacto/
- Acessibilidade digital (escopo próprio para entidades abrangidas): https://diariodarepublica.pt/dr/detalhe/decreto-lei/83-2018-116734769

**Estado:** minuta técnica no branch; nada publicado na produção; nada modificado no Supabase.
