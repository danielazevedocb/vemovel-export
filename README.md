# Vemovel Export

Aplicação Next.js 15.5.4 criada para consumir a API existente do projeto Vemovel e gerar arquivos de texto nos layouts **CADTPG** e **CADTIPOPAG**.

## Requisitos

- Node.js 18 ou superior
- API Nest (`vemovel-api`) em execução e acessível via HTTP
- Empresas cadastradas na API (as exportações dependem da escolha de uma empresa)

## Configuração

1. Copie o arquivo `.env.example` para `.env.local`.
2. Ajuste `NEXT_PUBLIC_VEMOVEL_API_URL` para apontar para a URL base da API Nest (sem o sufixo `/api`, ex.: `http://localhost:3001`).
3. Caso o servidor Next precise falar com a API por um host interno (render.com, docker compose etc.), defina `API_URL_INTERNAL` com esse endereço.
4. Garanta que exista ao menos uma empresa ativa via `vemovel-api` (`POST /api/empresas`).

## Scripts úteis

```bash
npm install       # instala dependências
npm run dev       # inicia o servidor em modo desenvolvimento (http://localhost:3000)
npm run lint      # executa verificação de lint
npm run build     # gera build de produção
npm run start     # inicia build de produção
```

## Como funciona

- A interface consulta `/api/empresas` para listar as empresas disponíveis.
- O usuário seleciona a empresa e, então, os botões de exportação são liberados.
- Os botões chamam as rotas internas `/api/export/cadtpg` e `/api/export/cadtipopag`, repassando o `empresaId` selecionado.
- Cada rota consulta a API Nest multi-tenant (`/api/empresas/:empresaId/prazo` ou `/api/empresas/:empresaId/cadtipopag`), formata os dados e devolve o TXT correspondente pronto para download.

Garanta que os registros retornados pela API possuam os campos definidos no modelo Prisma (`CADTPG` e `CADTIPOPAG`) para que os layouts sejam montados corretamente.
