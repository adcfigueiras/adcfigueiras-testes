# ADC Figueiras — Auditoria legal e privacidade pré-lançamento

Data da revisão inicial: 21/10/2026. Âmbito: código estático no branch `feature/public-member-match-center`, configuração de tabelas/advisors Supabase, app alojada no GitHub Pages. **Este documento é uma auditoria técnica preliminar, não parecer jurídico nem certificação.**

## Documentos e funcionalidades preparadas apenas na ramificação
- `termos.html`: Termos e Condições — minuta, com dados do responsável por confirmar.
- `privacidade.html`: Política de Privacidade — minuta alinhada com os dados e serviços identificados.
- `cookies.html`: Política de Cookies e Armazenamento Local — minuta, sem banner desnecessário.
- `legal.css`: estilos responsivos/acessíveis.
- Links no ecrã de entrada, barra lateral e secção Privacidade; checkbox obrigatório de aceitação dos Termos no formulário de criação de conta.
- Alt text revisto nos emblemas do HTML estático e no destaque do próximo jogo; emblemas de equipas dinâmicos já tinham alt com o nome da equipa.

## PRIORIDADE 0 — Antes da publicação pública

1. **Confirmar entidade responsável**: o desenvolvedor confirmou que está a construir a app **para a associação ADC Figueiras**, não como produto pessoal. Em princípio, a associação será responsável pelo tratamento se decidir finalidades e meios essenciais. Identificação fornecida para os documentos: **Associação Desportiva e Cultural de Figueiras — NIPC 501621245 — sede: Rua ADC Figueiras, n.º 217, 4620-204 Figueiras, Lousada**. Confirmar contactos oficiais para RGPD, responsável pela resposta a pedidos e, se existir, DPO/EPD. Não usar dados pessoais do programador por defeito. Atualmente a app exibe `adcf2015@gmail.com`; é necessário confirmar se esse é o contacto apropriado. Não substituir silenciosamente por outro.
2. **Governança do desenvolvedor**: confirmar se o programador atua sob autoridade direta da associação (ex.: membro/colaborador autorizado) ou como prestador externo com acesso a dados pessoais. No segundo caso, avaliar acordo de subcontratação conforme art. 28.º RGPD, instruções documentadas, confidencialidade, controlo de acessos, devolução/eliminação de dados ao terminar as funções e utilização de fornecedores. O título de «programador» isoladamente não determina a qualificação.
3. **Dados de saúde / pesagens**: avaliar se peso e estados de lesão constituem dados de saúde no contexto, determinar fundamento jurídico do art. 6.º e condição do art. 9.º RGPD, efetuar teste de necessidade/minimização e, se aplicável, avaliação de impacto (AIPD). **Rever se todos os atletas devem poder ver as pesagens de colegas**. Uma declaração genérica nos Termos não legitima a divulgação.
3. **Menores**: apurar se existem menores, estabelecer regras de acesso e recolha de autorizações quando necessárias. O art. 16.º da Lei 58/2019 refere 13 anos para consentimento em serviços da sociedade de informação; não resolve automaticamente o tratamento de imagens e dados de saúde de menores.
4. **Segurança localStorage/cache**: `app.js` persiste `state` no localStorage sob `adc-figueiras-team-manager-v3-dev` e cria backups locais, incluindo dados de equipa potencialmente sensíveis. Rever o ciclo de logout, troca de conta, modo público, acesso offline e permissões; garantir purga de informação privada ao mudar de identidade. Idealmente não persistir pesagens e dados sensíveis no browser, ou minimizar fortemente.
5. **Autorizações de imagem e propriedade intelectual**: existem emblemas carregados remotamente de `zerozero.pt` e `afporto.pt`. Confirmar autorização/licenças de reprodução e redistribuição; preferir ficheiros autorizados e localmente alojados. Não assumir que a imagem estar num site a torna livre. Confirmar também direitos de fotos de jogadores, patrocinadores e terceiros.
6. **Termos e consentimento**: checkbox de aceitação criado no registo, mas **a aceitação ainda não é persistida como prova no Supabase**; desenhar registo auditável de versão e data/conta antes de considerar o fluxo concluído. Não usar essa checkbox como “consentimento” para pesagens ou fotografias. Se a base legal para algum tratamento exigir consentimento, adicionar autorização separada, granular, revogável e registada.
7. **Completar Política de Privacidade**: finalidades e bases jurídicas concretas por categoria, destinatários, retenções, contacto RGPD, direitos, destinatários fora do EEE, contratos DPA com prestadores, transferências, menores e resposta a incidentes. Definir política de eliminação de contas e retenção de backups.
8. **Testes funcionais e de segurança em produção de teste**: perfis anon/público, membro, jogador, capitão, staff, admin; tentar pedidos diretos à API RLS; confirmar que fotos, pesos, assiduidade, estados de lesão e multas não são acessíveis indevidamente; verificar dados locais após logout.

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
