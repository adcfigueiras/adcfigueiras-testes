# ADC Figueiras — Ambiente de TESTES

Esta é a cópia de testes da aplicação ADC Figueiras. O plantel e os jogos utilizados são fictícios.

**Site previsto:** https://adcfigueiras.github.io/adcfigueiras-testes/

**Supabase de testes:** `exqqcpxvegqkjwenriik`

A cache da PWA e as preferências do navegador são diferentes das da aplicação oficial. As notificações push estão desativadas.

## Ativação do GitHub Pages

No repositório de testes: **Settings → Pages → Deploy from a branch → main → /(root) → Save**.

No Supabase de testes: **Authentication → URL Configuration** e definir o Site URL `https://adcfigueiras.github.io/adcfigueiras-testes/` e o Redirect URL `https://adcfigueiras.github.io/adcfigueiras-testes/**`.

**Atenção:** nunca copiar este `app.js` ou `index.html` para o site oficial, pois a configuração da base de dados é específica dos testes. Transportar para produção apenas as alterações funcionais validadas.
