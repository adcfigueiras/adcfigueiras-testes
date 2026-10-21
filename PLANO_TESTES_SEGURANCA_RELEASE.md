# Plano de testes de segurança e publicação — ADC Figueiras

**Estado:** checklist de pré-lançamento, 21/10/2026. **Não publicar a branch nem executar as migrações diretamente no Supabase de produção sem validar todos os passos.**

## 0. Preservar dados e preparar ambiente de testes

- [ ] Na aplicação **atualmente publicada**, entrar como Admin e exportar **snapshot de release** e **backup JSON**. Guardar os ficheiros num local privado com acesso restrito (não os colocar no repositório, nem enviar a serviços públicos).
- [ ] Confirmar que os ficheiros foram descarregados e contêm o histórico esperado (jogos, convocatórias, treinos, pesagens, multas e épocas).
- [ ] Copiar manualmente o **modelo do plano alimentar** atualmente introduzido nas Definições (se existir), pois a nova versão deixa de o guardar no navegador.
- [ ] Preparar um projeto Supabase **separado** de teste com dados fictícios e contas de cada categoria, após confirmar organização e eventuais custos. Não usar dados reais de atletas em ambientes de teste sem necessidade e salvaguardas.
- [ ] Preparar um site de teste separado para a branch. **O GitHub Pages de produção continua a apontar para `main`**, portanto uma branch do GitHub não é, por si só, uma pré-visualização funcional.

## 1. Migrações previstas e ordem de validação

**Testes estáticos do GitHub Actions:** a execução de 21/10/2026 passou, incluindo isolamento do pacote de pré-produção (<https://github.com/adcfigueiras/adcfigueiras.github.io/actions/runs/39620976338>). Este sucesso não substitui testes de API/RLS em projeto Supabase de testes.

As **quatro migrações** estão apenas preparadas no repositório:

1. `SUPABASE_MIGRATION_NUTRITION_SETTINGS.sql`: criar tabela privada de configurações nutricionais. Testar RLS e atualização por staff/admin; repor o template antigo, se existir.
2. `SUPABASE_MIGRATION_TERMS_ACCEPTANCES.sql`: registar versão dos Termos e instante do registo. Testar criação de conta, email de confirmação, utilizadores por convite e que o cliente não pode alterar o próprio registo.
3. `SUPABASE_MIGRATION_CALLUP_PUBLIC.sql`: disponibilizar a convocatória a todos depois da primeira publicação e preparar a notificação geral. Confirmar que não há reenvio ao editar.
4. `SUPABASE_MIGRATION_SECURITY_RATE_LIMIT.sql`: aplicar limitação de pedidos por utilizador no servidor e testar exceções, concorrência e limites.

**Importante:** as minutas SQL têm de ser revistas e testadas no ambiente de desenvolvimento antes de se proceder a qualquer alteração de produção. Confirmar compatibilidade com as políticas existentes e efeitos de eventuais dados históricos.

## 2. Acesso por função — testar na app e diretamente na API

| Informação/ação | Público (sem conta) | Sócio | Jogador | Capitão | Staff | Admin |
|---|---:|---:|---:|---:|---:|---:|
| Plantel, jogos e resultados | Sim | Sim | Sim | Sim | Sim | Sim |
| Match Center e convocatória publicada | Sim | Sim | Sim | Sim | Sim | Sim |
| Convocatória não publicada antes do jogo | Não | Não | Sim | Sim | Sim | Sim |
| Pesagens de todos os atletas | Não | Não | Sim | Sim | Sim | Sim |
| Presenças, disponibilidade e treinos internos | Não | Não | Sim | Sim | Sim | Sim |
| Multas dos colegas | Não | Não | Não | Sim | Sim | Sim |
| Gerir jogos e pesagens | Não | Não | Não | Não | Sim | Sim |
| Configurar plano alimentar privado | Não | Não | Não | Não | Sim | Sim |

- [ ] Para cada categoria, verificar interfaces e pedidos diretos à API. Ocultar um separador não substitui segurança na base de dados.
- [ ] Verificar que um membro não pode ler `weigh_ins`, `match_weigh_ins`, `training_attendance`, `fines`, `nutrition_settings` ou `push_subscriptions` alheias.
- [ ] Verificar RLS com contas reais de teste e tokens de cada função, não só com pré-visualização Admin.
- [ ] Para jogos agendados: o visitante não vê jogadores em `match_players` antes de publicar; vê apenas os `called_up=true` depois da publicação. Registos de não convocados continuam privados antes do resultado final.
- [ ] O cinco inicial e outros dados do jogo não devem revelar informação clínica nem pesagens.
- [ ] Repetir os testes para épocas históricas e mudanças de época.

## 3. Notificações e planos de nutrição

- [ ] Publicar pela primeira vez uma convocatória num jogo de teste. A convocatória deve surgir na área pública sem revelar pesagens e deve criar uma notificação geral para os utilizadores elegíveis.
- [ ] Desativar a preferência «Convocatórias» numa conta: não deve receber o aviso.
- [ ] Editar a convocatória: a notificação geral não pode ser repetida.
- [ ] Confirmar que o aviso individual para jogadores convocados continua disponível e independente.
- [ ] Preparar/deploy em teste `supabase/functions/send-push-queue/index.ts`.
- [ ] Criar aviso de plano pré-jogo com **peso médio fictício**. No lock screen/push deve surgir apenas a mensagem genérica; os detalhes ficam exclusivamente na caixa autenticada do destinatário.
- [ ] Verificar que destinatários diferentes não consultam os planos uns dos outros e que a conta sem autorização não lê a configuração privada do template.

## 4. Sessões, backups e PWA

- [ ] Terminar sessão numa conta interna, abrir modo público e confirmar que pesos, faltas, multas, planos e emails internos **não** estão na cache da aplicação (`localStorage` / `sessionStorage` / Cache API).
- [ ] Abrir a app offline depois de terminar sessão; não devem reaparecer dados privados.
- [ ] Alternar Admin → Sócio → Público e testar com duas contas reais distintas num dispositivo partilhado.
- [ ] Conferir a sanitização de backups de versões anteriores e a recuperação de dados do Supabase, sem perda de histórico.
- [ ] Validar imagens, carregamento da app, fluxo de registo e calendário horizontal em Android, iOS e desktop.
- [ ] Testar desinstalação/reinstalação da PWA, atualização de caches e sessão sem alterar ou recriar contas.

## 5. Legal, acessibilidade, terceiros e divulgação

- [ ] Validar por pessoa responsável da associação e assessoria jurídica as versões finais de Termos, Privacidade e Cookies; remover avisos de minuta / `noindex` somente após validação.
- [x] Confirmado pelo responsável pelo projeto em 21/10/2026: **não existem atletas menores de 18 anos no plantel atual**.
- [ ] Definir procedimento para verificar a idade de novos atletas e avaliar, antes da inclusão de menores, as autorizações e proteções aplicáveis; confirmar separadamente se o serviço permite contas de utilizadores menores.
- [ ] Documentar fundamento jurídico e condição adicional quando aplicável para tratar dados de saúde e permitir a consulta interna partilhada das pesagens.
- [x] Confirmada a origem das fotografias do plantel: tiradas por uma pessoa ligada ao clube (informação dada em 21/10/2026).
- [ ] Confirmar com o fotógrafo os direitos/licença para utilizar e publicar as fotos; informar os jogadores sobre a divulgação e documentar o fundamento jurídico. Confirmar separadamente emblemas de adversários e patrocinadores.
- [ ] Inspecionar, em janela privada, a rede e os dados do navegador (cookies/armazenamento) antes e depois do login; confirmar scripts externos e que não há tracking não essencial sem consentimento.
- [ ] Rever acessibilidade: alt text, foco de teclado, contraste, navegação, labels e leitura da política no telemóvel.
- [ ] Rever avisos do Supabase Security Advisor, incluindo funções privilegiadas e proteção contra palavras-passe comprometidas, e definir medidas aprovadas.
- [ ] Definir prazos de conservação, eliminação de contas, resposta a direitos dos titulares, incidentes e backups.
- [ ] Confirmar identificação e contacto da associação, e responsável interno por responder a mensagens enviadas a `adcf2015@gmail.com`.

## 6. Critério de conclusão

**Não publicar enquanto houver falha crítica de privacidade, migrações por aplicar/testar, backups não verificados, direitos de utilização de conteúdo por esclarecer ou documentos legais por validar.**

Depois de tudo validado, preparar release numerada em `main`, testar o GitHub Pages e a instalação/atualização no telemóvel; monitorizar erros pós-publicação.
