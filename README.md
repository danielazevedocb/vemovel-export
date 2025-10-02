# Vemovel Export

Aplicação Next.js 15.5.4 criada para consumir a API existente do projeto Vemovel e gerar arquivos de texto no layout **CADTPG**.

## Requisitos

- Node.js 18 ou superior
- API Nest (`vemovel-api`) em execução e acessível via HTTP

## Configuração

1. Copie o arquivo `.env.example` para `.env.local`.
2. Ajuste `VEMOVEL_API_URL` para apontar para a URL base da API Nest (ex.: `http://localhost:3000`).

## Scripts úteis

```bash
npm install       # instala dependências
npm run dev       # inicia o servidor em modo desenvolvimento (http://localhost:3000)
npm run lint      # executa verificação de lint
npm run build     # gera build de produção
npm run start     # inicia build de produção
```

## Como funciona

- A página inicial oferece botões para gerar os arquivos `CADTPG.txt` e `CADTIPOPAG.txt`.
- Os botões chamam as rotas internas `/api/export/cadtpg` e `/api/export/cadtipopag`.
- Cada rota consulta a API (`/prazo` ou `/cadtipopag`), formata os dados e devolve o TXT correspondente pronto para download.

Garanta que os registros retornados pela API possuam os campos definidos no modelo Prisma (`CADTPG`) para que o layout seja montado corretamente.
