# Pontelo

**Encontre ajuda gratuita perto de você.** O Pontelo é um mapa colaborativo e conferido de serviços públicos e gratuitos (abrigos, refeitórios, atendimento jurídico, saúde, CRAS e emissão de documentos) para pessoas em situação de vulnerabilidade.

> Projeto acadêmico. Os serviços que aparecem no ambiente de desenvolvimento são **fictícios**.

## O que dá para fazer

| Quem | O quê |
|---|---|
| Qualquer pessoa, sem conta | Buscar por GPS, CEP ou cidade; filtrar por categoria e "aberto agora"; ver lista e mapa; ligar e traçar rota; denunciar informação errada (anônimo) |
| Quem tem conta | Confirmar que um serviço ainda funciona; sugerir serviço novo; baixar ou excluir os próprios dados |
| Moderação | Aprovar ou rejeitar sugestões; tratar denúncias; tirar serviço do ar |
| Pesquisadores e outros sites | API pública de leitura e exportação em GeoJSON |

**Modo discreto:** em `/modo-discreto`, a pessoa instala no celular uma calculadora que funciona de verdade (nome e ícone de "Calculadora"). Um código secreto seguido de `=` envia por e-mail um pedido de ajuda com a localização para até 3 contatos de confiança; outro código abre o Pontelo. A tela não muda (se o envio falhar, aparece "Erro"), e a saída rápida do Pontelo volta para a calculadora. Os contatos ficam só no celular; cada um precisa aceitar por e-mail antes de receber alertas. **Não substitui o 190.**

**Proteção de quem busca ajuda:** botão de saída rápida (ou tecla Esc), nenhuma localização gravada no servidor ou no endereço da página, e endereço sigiloso para abrigos de vítimas de violência (sem endereço, sem marcador no mapa e distância arredondada).

## Tecnologias

- **Front-end:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query, Leaflet (OpenStreetMap)
- **Back-end:** Node.js, Fastify 5, Zod (validação e documentação Swagger), Prisma 7, Argon2id, JWT
- **Banco:** PostgreSQL 16 com PostGIS (consultas por distância)
- **Endereços:** ViaCEP e Nominatim (OpenStreetMap), com cache e fila de 1 pedido por segundo

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) 22 ou mais novo
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) aberto

### 1. Configurar o ambiente

Copie o modelo e preencha os valores em branco:

```bash
cp .env.example .env
```

- `POSTGRES_PASSWORD`: uma senha qualquer. Use a mesma dentro da `DATABASE_URL`, no lugar de `SENHA`.
- `JWT_SECRET` e `REFRESH_TOKEN_SECRET`: dois textos longos e diferentes. Para gerar cada um:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

- `SEED_SENHA_MODERADOR`: senha da conta de moderação criada no passo 3.

### 2. Subir o banco

```bash
docker compose up -d
```

O banco fica na porta **5433** (e não na 5432) para não brigar com um PostgreSQL instalado no computador. Na primeira vez, o `schema.sql` cria as tabelas sozinho.

### 3. Back-end

```bash
cd backend
npm install
npm run seed
npm run dev
```

O `seed` cria 10 serviços fictícios em São Paulo e a conta de moderação (`SEED_EMAIL_MODERADOR` / `SEED_SENHA_MODERADOR`). Pode rodar de novo quando quiser: ele recria os serviços de exemplo.

A API sobe em `http://localhost:3000`, com documentação interativa em **http://localhost:3000/docs**.

Os e-mails do modo discreto (convites e alertas) não saem para a internet em desenvolvimento: aparecem no **Mailpit**, em **http://localhost:8025**. Para enviar de verdade, troque as variáveis `SMTP_*` do `.env` pelas de um provedor de e-mail.

### 4. Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra **http://localhost:5173** e busque o CEP `01310-100` (Avenida Paulista), com raio de 10 km, para ver os 10 serviços.

> Para mostrar o site sem back-end, use `VITE_USAR_EXEMPLOS=true` no `.env`: o front usa dados de exemplo embutidos.

### Recriar o banco do zero

Apaga **todos** os dados do banco local:

```bash
docker compose down -v
docker compose up -d
cd backend && npm run seed
```

## Scripts

| Pasta | Comando | O que faz |
|---|---|---|
| `backend` | `npm run dev` | API com recarga automática |
| `backend` | `npm test` | Testes automatizados (regras de horário e permissões de cada rota) |
| `backend` | `npm run verificar` | Confere os tipos do TypeScript |
| `backend` | `npm run seed` | Dados de exemplo e conta de moderação |
| `frontend` | `npm run dev` | Site com recarga automática |
| `frontend` | `npm run build` | Versão de produção em `frontend/dist` |
| `frontend` | `npm run lint` | Confere o código com o ESLint |

## Estrutura

```
pontelo/
├── schema.sql              Tabelas, gatilho do selo e view pública (PostGIS)
├── docker-compose.yml      PostgreSQL + PostGIS
├── backend/
│   ├── prisma/             schema.prisma (gerado do banco) e seed.ts
│   ├── src/
│   │   ├── rotas/          Recebem o pedido e validam (Zod)
│   │   ├── servicos/       Regras de negócio (horários, moderação, login…)
│   │   ├── repositorios/   Consultas ao banco
│   │   ├── esquemas/       Formatos de entrada e saída (viram o Swagger)
│   │   └── plugins/        Banco e autenticação
│   └── testes/
└── frontend/src/
    ├── paginas/            Uma por rota do site
    ├── componentes/        Peças reutilizáveis (botões, cartões, mapa…)
    ├── servicos/           Chamadas à API e sessão
    └── dados/              Categorias, telefones e dados de exemplo
```

## API

Todas as rotas começam com `/api/v1`. Lista completa, com exemplos, em `/docs`.

| Rota | Acesso |
|---|---|
| `GET /servicos`, `GET /servicos/{id}`, `GET /categorias`, `GET /geocodificar` | Pública |
| `GET /dados/servicos.geojson` | Pública (dados abertos) |
| `POST /servicos/{id}/denuncias` | Pública e anônima (5 a cada 10 min) |
| `POST /auth/registro`, `/auth/login`, `/auth/refresh`, `/auth/logout` | Pública |
| `GET /me`, `GET /me/dados`, `DELETE /me` | Com login |
| `POST /servicos`, `POST /servicos/{id}/confirmacoes` | Com login |
| `POST /alerta`, `/alerta/contatos/...` | Pública, sem conta (modo discreto; só envia para contatos que aceitaram) |
| `/moderacao/...` | Só moderação |

Erros sempre no mesmo formato: `{ "erro": { "codigo": "...", "mensagem": "...", "detalhes": [...] } }`.

## Segurança e privacidade

- Senhas com **Argon2id**; nenhuma senha ou token aparece em log.
- **Token de acesso de 15 minutos**, guardado só na memória do navegador.
- **Sessão de 7 dias** em cookie `HttpOnly` e `SameSite=Strict`:
  - o cookie é trocado a cada uso;
  - o banco guarda só o hash;
  - se um cookie antigo for reutilizado, todas as sessões da pessoa são encerradas.
- Toda sugestão nasce **pendente** e só aparece depois da moderação; cada decisão fica registrada.
- **Limite de pedidos** por IP (100 por minuto; menos no login, nas sugestões e nas denúncias).
- **LGPD:** só nome e e-mail de quem cria conta, aceite explícito, política de privacidade em `/privacidade`, exportação dos dados e exclusão da conta em `/minha-conta`.

## Limitações conhecidas

- A moderação ainda não edita um serviço publicado; ela pode tirá-lo do ar ou tratar a denúncia.
- Chaves de API, painel de organização, modo offline e estatísticas ficaram para versões futuras.
- O modo discreto envia o alerta por e-mail, que pode atrasar ou cair no spam. SMS ou WhatsApp exigiriam um provedor pago.
- A calculadora é instalada pelo navegador, então o site do Pontelo fica no histórico até a pessoa apagá-lo.
