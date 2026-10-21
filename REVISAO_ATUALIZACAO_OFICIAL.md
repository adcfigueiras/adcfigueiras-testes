# Revisão da atualização oficial — 21/10/2026

## Referências verificadas

- Produção: `adcfigueiras/adcfigueiras.github.io`, main `d02e60cf4a248eb28310dc307202adfccceccb01`.
- Testes: `adcfigueiras/adcfigueiras-testes`, main funcional `6d2a861847a6d2e5aba0b3485f774c1bba8bf1d4`.
- Produção consultada apenas em leitura. Nenhuma publicação ou migração aplicada.

## Alterações a transportar

- Plantel e Match Center públicos, incluindo convocatórias publicadas; dados internos continuam sujeitos a permissões.
- Aviso geral de convocatória, preferências e prevenção de nova publicação do mesmo jogo.
- Calendário móvel com deslocação horizontal.
- Cache pública sanitizada, validações de formulários/importações, CSP e dependência Supabase fixada.
- Documentos legais e aceitação dos Termos no registo.
- Modelo nutricional privado no backend; push nutricional passa a mensagem genérica.
- Limites de pedidos nas operações próprias.

Pesagens de jogo e auto-golo adversário já existem na versão oficial; os ensaios feitos foram verificações de regressão, não funcionalidades novas.

## Sequência de publicação, sujeita a autorização

1. Preservar o modelo alimentar e a referência de peso guardados localmente no navegador usado pela equipa técnica/admin. A nova versão limpa essa configuração local e inicia a configuração remota vazia. Não atualizar antes de guardar o conteúdo ou confirmar que não existe modelo em uso.
2. Fazer cópia de segurança dos dados e esquema de produção e verificar o procedimento de recuperação. O snapshot da app não substitui um backup completo de Auth/Storage/base de dados.
3. Preparar uma versão de publicação com o Supabase, chave pública VAPID, identidade PWA, caminhos e chaves de armazenamento de produção. Preservar calendário/equipas oficiais; não copiar os dados fictícios, as chaves de testes ou a faixa TESTES. Manter o push após terminar sessão.
4. Aplicar, por ordem: NUTRITION_SETTINGS, TERMS_ACCEPTANCES, SECURITY_RATE_LIMIT, CALLUP_PUBLIC. Confirmado em leitura que produção ainda não tem as tabelas/coluna/RPCs correspondentes. Preservar as definições anteriores das funções substituídas para reversão.
5. Repor a configuração alimentar preservada na nova tabela privada, se existir.
6. Atualizar `push-test` (limite de pedidos) e `send-push-queue` (proteção do texto nutricional e respostas). Preservar as chaves e o agendamento existentes de produção. Não copiar o segredo ou o cron de testes.
7. Publicar o frontend com novas versões de recursos/cache. A limpeza da cache oficial deve excluir as caches de testes; o clique de push oficial também deve evitar a janela de testes, pois a origem é partilhada.
8. Verificação breve após publicação: carregamento, sessão existente, dados oficiais, áreas públicas e ausência de erros. Evitar notificações gerais reais apenas para teste sem autorização explícita.

## Reversão

- Frontend: restaurar o commit oficial acima, com atenção à cache dos dispositivos.
- Edge Functions: guardar e restaurar as versões anteriores (consultadas: push-test v2; send-push-queue v1).
- Base de dados: as tabelas/coluna novas são aditivas; não apagar dados recém-criados. Reverter funções/políticas alteradas de forma dirigida se necessário. Repor todo o backup apenas como último recurso, pois perderia alterações posteriores.
- Confirmar novamente o HEAD oficial antes de preparar/publicar, para não sobrepor alterações entretanto realizadas.

## Evidência de validação

- Utilizador confirmou no navegador os fluxos de convocatória pública, ocultação antes de publicação, pesagens, calendário, recuperação de conta, treinos e estatísticas.
- Aviso geral de convocatória confirmado dentro da app e por push; preferências confirmadas pelo utilizador.
- Formulário bloqueia registo sem aceitar Termos, confirmado pelo utilizador. Isto não equivale a proibição de criação de conta pela API: o trigger regista a aceitação quando enviada e mantém fluxos internos compatíveis.
- Não repetir testes com segunda conta/dispositivo partilhado, conforme decisão do utilizador. Não afirmar que foram realizados.
- Sintaxe de app/service worker e verificações estáticas de segurança passaram nesta revisão.
- Gerador de pré-produção corrigido: aceita origem já adaptada, isola chaves/cache, remove dados iniciais reais e gera manifest JSON válido. Teste de build passou após a correção.
- As quatro migrações tinham sido testadas no Supabase de testes e em CI; nesta revisão foi confirmada a sua ausência em produção, sem reaplicação.
- Não foi realizada nesta revisão uma matriz completa Android/iPhone nem certificação jurídica dos documentos.

## Estado

Revisão técnica realizada. Publicação ainda não autorizada nem executada. Faltam preservação da configuração alimentar, backup recuperável e preparação/verificação do pacote com configuração de produção.
