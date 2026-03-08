# Ainda Estou Aqui... Estudando

Banco de questões estilo UERJ sobre o livro **"Ainda Estou Aqui"** de Marcelo Rubens Paiva — 501 questões organizadas por capítulo e subtópico, com acompanhamento de progresso.

## Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui, Tailwind CSS v4, Phosphor Icons
- **ORM**: Prisma (PostgreSQL)
- **Auth**: Better Auth (Google OAuth)
- **Pagamentos**: Stripe Embedded Checkout
- **Deploy**: Railway

## Estrutura

```
├── src/              # App Next.js (pages, API routes, components)
├── prisma/           # Schema Prisma
├── content/          # Texto do livro, análises e templates de questões
├── db/               # Schema SQL, seeds e backups
└── ...configs
```

## Desenvolvimento

```bash
npm install
npm run dev
```

Requer um `.env.local` com:

```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm test` | Vitest |

## Deploy

Deploy automático via Railway ao fazer push para `main`. Domínio: `ainda.miguelito.xyz`
