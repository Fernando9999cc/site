# PROMIZE – site com pagamento PurinCash

## Arquivos
- `index.html` – o site.
- `netlify/functions/checkout.mjs` – cria a cobrança PIX ou o checkout de cartão na PurinCash.
- `netlify/functions/status.mjs` – consulta se o PIX foi pago.
- `netlify/functions/webhook.mjs` – recebe o aviso de pagamento da PurinCash.
- `netlify/lib/purin.mjs` – preços dos planos e chamada à API.
- `netlify.toml` – configuração do Netlify.

A chave da PurinCash NÃO fica no site. Ela fica só nas variáveis de ambiente do Netlify.

## 1. Gere uma chave nova
A chave enviada no chat ficou exposta. No painel da PurinCash, revogue a chave antiga e crie uma nova.

## 2. Cadastre a chave no Netlify
Site configuration > Environment variables > Add a variable:
- `PURIN_API_KEY` = sua chave nova (`ps_live_...`)
- `PURIN_WEBHOOK_SECRET` = segredo de webhook do painel PurinCash (opcional, recomendado)

## 3. Publique com as funções
Arrastar a pasta no Netlify Drop não publica as funções. Use um destes caminhos:

**Netlify CLI** (dentro desta pasta):
```
npx netlify-cli login
npx netlify-cli link
npx netlify-cli deploy --prod
```

**GitHub**: suba esta pasta num repositório e conecte o repositório ao site no Netlify.

## 4. Teste antes de vender
Use uma chave `ps_test_` primeiro. O PIX de teste começa com `SANDBOX_PIX_`.
Para marcar como pago no sandbox: `POST /v1/sandbox/charges/{id}/simulate-paid`.
O cartão não funciona no sandbox; teste com um valor real baixo.

## Mudar preços
Edite `PLANOS` em `netlify/lib/purin.mjs`. O valor cobrado vem dali, não do navegador.
Atualize também os preços exibidos no `index.html`.
