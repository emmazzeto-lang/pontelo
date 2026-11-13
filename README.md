# Pontelo

Plataforma web para localização e verificação colaborativa de serviços públicos e gratuitos (abrigos, refeitórios, atendimento jurídico, saúde, CRAS e emissão de documentos) voltada a pessoas em situação de vulnerabilidade.

Projeto acadêmico. Os registros carregados pelo script de seed são fictícios e servem apenas para demonstração.

## Funcionalidades

- **Busca pública (sem cadastro):** pesquisa por GPS, CEP ou endereço; filtros por categoria, distância e funcionamento no momento; visualização em lista ou mapa; denúncia anônima de informações incorretas.
- **Colaboração (com conta):** confirmação de funcionamento de serviços (atualizando o selo de verificação de 90 dias), sugestão de novos locais, exportação de dados pessoais e exclusão de conta.
- **Moderação:** fila de análise para aprovar, rejeitar ou arquivar sugestões de serviços e gerenciar denúncias abertas.
- **Modo discreto e segurança:**
  - Botão de saída rápida (ou tecla `Esc`) que encerra a sessão local e redireciona para uma busca neutra.
  - Omissão de endereço e coordenadas exatas em abrigos com endereço sigiloso.
  - Calculadora funcional instalável (`/calculadora.html`), configurada em `/modo-discreto`, que permite abrir o Pontelo ou disparar alertas por e-mail com geolocalização para contatos de confiança previamente confirmados.
- **Dados abertos:** exportação dos serviços publicados em formato GeoJSON e documentação OpenAPI/Swagger.

## Tecnologias

- **Front-end:** React 19, TypeScript, Vite, Tailwind CSS 4, React Router, TanStack Query, Leaflet (OpenStreetMap)
- **Back-end:** Node.js, Fastify 5, Zod, Prisma 7, Argon2id, JWT, Nodemailer
- **Banco de dados:** PostgreSQL 16 com extensão PostGIS
- **Geocodificação:** ViaCEP e Nominatim (OpenStreetMap) com cache em banco

## Execução local

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose

### 1. Variáveis de ambiente

Copie o arquivo de exemplo na raiz do projeto e preencha os segredos necessários:

```bash
cp .env.example .env
```

Defina uma senha para `POSTGRES_PASSWORD` (repetindo-a em `DATABASE_URL`), a senha inicial `SEED_SENHA_MODERADOR` e chaves aleatórias para `JWT_SECRET` e `REFRESH_TOKEN_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 2. Banco de dados e servidor de e-mail de teste

```bash
docker compose up -d
```

O PostgreSQL + PostGIS é exposto na porta `5433` e inicializado automaticamente com o script `schema.sql`. O Mailpit fica disponível em `http://localhost:8025` para inspecionar os e-mails enviados em ambiente de desenvolvimento.

### 3. Back-end

```bash
cd backend
npm install
npm run seed
npm run dev
```

A API será iniciada em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/docs`.

### 4. Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`. Para testar a busca com os dados do seed em São Paulo, utilize o CEP `01310-100` com raio de 10 km. Caso queira executar o front-end sem a API, defina `VITE_USAR_EXEMPLOS=true` no `.env`.

## Scripts principais

### Back-end (`./backend`)

- `npm run dev`: inicia o servidor em modo de desenvolvimento
- `npm test`: executa os testes automatizados (horários e controle de acesso)
- `npm run verificar`: executa a checagem de tipos do TypeScript
- `npm run seed`: popula o banco com serviços de exemplo e a conta de moderação

### Front-end (`./frontend`)

- `npm run dev`: inicia o servidor de desenvolvimento do Vite
- `npm run build`: gera os arquivos de produção em `frontend/dist`
- `npm run lint`: analisa o código com ESLint

## Estrutura do projeto

```
pontelo/
├── schema.sql              Estrutura do banco, triggers e view pública (PostGIS)
├── docker-compose.yml      Containers PostgreSQL/PostGIS e Mailpit
├── backend/
│   ├── prisma/             Schema do Prisma e script de seed
│   ├── src/
│   │   ├── esquemas/       Schemas Zod de validação
│   │   ├── plugins/        Conexão com banco, autenticação e e-mail
│   │   ├── repositorios/   Consultas SQL/Prisma
│   │   ├── rotas/          Endpoints da API (/api/v1)
│   │   └── servicos/       Regras de negócio e geocodificação
│   └── testes/             Testes automatizados
└── frontend/
    ├── calculadora.html    Entrada independente da calculadora (modo discreto)
    └── src/
        ├── calculadora/    Interface e lógica da calculadora
        ├── componentes/    Componentes reutilizáveis e mapa
        ├── dados/          Categorias, telefones úteis e dados de exemplo
        ├── discreto/       Preferências locais e envio de alertas
        ├── hooks/          Hooks de busca e saída rápida
        ├── paginas/        Telas da aplicação
        ├── servicos/       Cliente HTTP, tipos e controle de sessão
        └── utils/          Formatação de datas, distâncias e horários
```
