# TrainMe API

Full-featured backend for a Personal Trainer platform built with Node.js, Express, MongoDB, and TypeScript. It covers authentication, role-based access, trainer/client profiles, workout & nutrition plans, bookings, progress tracking, messaging, reviews, payments, and OpenAPI docs.

## Tech Stack

- Node.js (ESM) + Express 5
- MongoDB with Mongoose
- TypeScript with tsx for DX and Jest + Supertest for tests
- Zod for validation, JWT auth, bcrypt password hashing, Swagger UI docs

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy env vars**
   ```bash
   cp .env.example .env
   ```
   Fill in the Mongo URI (local or Atlas) and secure JWT secrets.
3. **Run development server**
   ```bash
   npm run dev
   ```
   The API runs on `http://localhost:4000` by default with docs at `/api/docs`.
4. **Production build**
   ```bash
   npm run build
   npm start
   ```
5. **Tests**
   ```bash
   npm test
   ```
   Tests run against an in-memory MongoDB instance.

## Project Structure

```
src/
  app.ts                Express app setup
  server.ts             Server bootstrap
  config/               env + database helpers
  controllers/          Request handlers per domain
  services/             Business logic per entity
  models/               Mongoose schemas
  routes/               Express routers grouped by feature
  middlewares/          Auth, roles, validation, errors
  utils/                Helpers (responses, tokens, logger)
  docs/                 Swagger spec
  tests/                Jest + Supertest specs
```

## Key Features

- **Auth**: Register/login (client default), refresh tokens, change & forgot password flows, bcrypt hashing.
- **Security**: JWT auth middleware, role-based guard, rate limiting, Helmet, CORS, centralized error handling.
- **Domain APIs**: CRUD for users, trainer & client profiles, workout/nutrition plans, bookings with double-book prevention, progress logs, messaging, reviews with rating aggregation, and mock payments.
- **Validation**: Zod schemas on every route + Mongoose schema validation/sanitization.
- **Documentation**: Swagger UI at `/api/docs` with bearer JWT security definition.
- **Testing**: Example Jest specs for auth, RBAC, and workout plan creation using mongodb-memory-server.

## Scripts

- `npm run dev` – tsx watch mode with live reload
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled server
- `npm test` – run Jest test suite (NODE_ENV=test)
- `npm run seed` – popular a base de dados com dados de demonstração

## Dados de demonstração

Para testar end-to-end com o frontend execute:

```bash
npm run seed
```

O script limpa as coleções principais e cria um cenário completo (admin, treinador, cliente, planos, sessões, mensagens, etc.). Credenciais padrão:

| Perfil    | Email               | Password     |
|-----------|---------------------|--------------|
| Admin     | admin@trainme.com   | Password123! |
| Treinador | trainer@trainme.com | Password123! |
| Cliente   | cliente@trainme.com | Password123! |

Pode definir `SEED_PASSWORD` no `.env` caso deseje outra palavra-passe antes de executar o seed.

## Next Steps

- Plug in a real email/SMS provider for password recovery
- Add refresh-token persistence/rotation for stronger security
- Extend Swagger docs with per-route schemas (currently basics are included)
