# Ainda Estou Aqui... Estudando — Plano de Implementacao

## Visao Geral

Web app de questoes estilo UERJ sobre o livro "Ainda Estou Aqui" de Marcelo Rubens Paiva.
Modelo freemium: amostra gratis com 5 questoes (de 12 pre-definidas), versao paga com banco completo.

---

## Stack

| Camada     | Tecnologia                                      |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js (App Router, full-stack)                |
| UI         | shadcn/ui, Tailwind CSS v4, Phosphor Icons      |
| Tipografia | Outfit (ja instalada) + fonte display editorial |
| ORM        | Prisma                                          |
| Banco      | PostgreSQL (Railway prod, localhost:5434 dev)   |
| Auth       | Better Auth (Google + Apple)                    |
| Pagamento  | Stripe Embedded Checkout (compra unica)         |
| Deploy     | Railway (dominio padrao .up.railway.app)        |

---

## Design

### Direcao estetica: Editorial literario com accent vermelho

Preset shadcn `a1ohby4` ja configurado. Paleta limpa com accent vermelho/rosa profundo,
fundos neutros, muted em tons frios. Inspiracao no universo do livro — memoria, tempo,
resistencia — mas executada com modernidade e contraste.

**Paleta (ja configurada via preset)**

| Token        | Valor oklch                | Visual              | Uso               |
| ------------ | -------------------------- | ------------------- | ----------------- |
| `--primary`  | `oklch(0.525 0.223 3.958)` | Vermelho profundo   | CTAs, destaques   |
| `--accent`   | `oklch(0.525 0.223 3.958)` | = primary           | Links, progresso  |
| `--bg`       | `oklch(1 0 0)`             | Branco              | Fundo principal   |
| `--card`     | `oklch(1 0 0)`             | Branco              | Cards             |
| `--fg`       | `oklch(0.148 0.004 228.8)` | Quase preto azulado | Texto principal   |
| `--muted-fg` | `oklch(0.56 0.021 213.5)`  | Cinza azulado       | Texto secundario  |
| `--border`   | `oklch(0.925 0.005 214.3)` | Cinza claro frio    | Bordas, divisores |

Cores adicionais a definir (custom tokens):

| Token         | Sugestao               | Uso             |
| ------------- | ---------------------- | --------------- |
| `--correct`   | `oklch(0.55 0.15 155)` | Verde — acerto  |
| `--incorrect` | `--destructive`        | Vermelho — erro |

Suporta dark mode (ja configurado no preset).

**Tipografia**

- Display/titulos: fonte serifada editorial (ex: Playfair Display, Lora, ou Bitter)
- Body/UI: Outfit Variable (ja configurada como `--font-sans`)
- Questoes/citacoes: italico serifado para trechos da obra

**Texturas e atmosfera**

- Fundo limpo com sutil noise/grain opcional
- Cards com borda fina (`--border`) e sombra suave
- Transicoes suaves, ease-out, sem exagero
- Espacamento generoso — a interface respira
- Dark mode como alternativa (toggle mantido do theme-provider)

---

## Paginas e Fluxo

### 1. Landing Page (`/`)

**Hero — animacao de abertura**

```
ainda estou aqui...        <- aparece palavra por palavra, fade-in + translate-y
    **estudando**           <- aparece por ultimo, bold, com leve scale-up
```

- Cada palavra aparece apos a anterior com ~400ms de delay
- "estudando" em peso bold + cor accent, com animacao ligeiramente diferente (scale de 0.95 a 1)
- Apos animacao completa (~2.5s), o conteudo abaixo faz fade-in

**Conteudo abaixo do hero**

```
Prepare-se para o Exame de Qualificacao da UERJ:

        [N]              <- numero com efeito de contagem (count-up de 0 ate o valor real)
     questoes             <- subtitulo
seguindo a bibliografia
     de apoio

    [ Comecar ]           <- CTA principal, cor accent
```

- O numero N vem de uma query: `SELECT COUNT(*) FROM questions WHERE status = 'approved'`
- Animacao count-up: 0 ate N em ~1.5s, easing desacelerado
- Se N = 0 (nenhuma aprovada ainda), mostrar o total de questoes planejadas (501) com label "em producao"

**Rodape da landing**

- Texto discreto: "Exame de Qualificacao UERJ — 1 de junho de 2026"

### 2. Fluxo de questoes — Amostra gratis (`/questoes`)

- Nao exige login para comecar
- 12 questoes pre-definidas (as primeiras 12 com status `approved`, ordenadas por ID)
- Usuario ve 1 questao por vez
- Seleciona alternativa -> feedback visual (correta = verde, errada = vermelho + mostra correta)
- Botao "Proxima" aparece apos responder
- Barra de progresso no topo: "Questao 3 de 5"
- **Na 5a questao**: apos responder, exibe dialog de upsell (ver secao 3)

**Layout da questao**

```
┌─────────────────────────────────────┐
│  Questao 3 de 5     [progresso ██░] │
│                                     │
│  Capitulo 8 — O telefone tocou      │  <- header discreto
│                                     │
│  "citacao direta do trecho da       │  <- serifada, italico
│   obra com referencia" (p. XX)      │
│                                     │
│  Contextualizacao do trecho.        │  <- body text
│                                     │
│  A pergunta em si:                  │  <- bold
│                                     │
│  ○ (A) alternativa a                │  <- radio-style, hover highlight
│  ○ (B) alternativa b                │
│  ○ (C) alternativa c                │
│  ○ (D) alternativa d                │
│                                     │
│           [ Confirmar ]             │  <- aparece ao selecionar
└─────────────────────────────────────┘
```

### 3. Dialog de upsell (apos 5a questao)

```
┌──────────────────────────────────────────┐
│                                          │
│   Voce completou a amostra gratis!       │
│                                          │
│   O banco completo tem [N] questoes      │
│   organizadas por capitulo e subtopico,  │
│   com acompanhamento do seu progresso    │
│   ate o dia da prova.                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  R$49,00  R$24,50                  │  │  <- preco cheio riscado
│  │  Acesso completo — 50% OFF         │  │
│  │  Ate 31 de marco                   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  "Nao, obrigado — ver minha ultima       │
│   questao"                               │  <- link discreto
│                                          │
└──────────────────────────────────────────┘
```

- Botao de compra: abre Stripe Embedded Checkout (secao 6)
- "Nao obrigado": fecha dialog, mostra questao 5 respondida (a ultima da amostra)
- Apos a 5a, nao ha "Proxima" — o fluxo gratis acaba ali

### 4. Autenticacao (`/login`)

- Necessaria para: comprar, acessar versao paga
- Better Auth com providers: Google e Apple
- Tela simples: logo + "Entre para continuar" + botoes Google/Apple
- Apos login, redireciona para onde o usuario estava (ou `/painel` se veio direto)

### 5. Painel do usuario pago (`/painel`)

**Header com progresso geral**

```
┌──────────────────────────────────────────────────┐
│  Seu progresso                                   │
│                                                  │
│  ██████████████░░░░░░░░  142 de 347  (41%)       │
│                                                  │
│  Faltam 205 questoes                             │
│  ~2.4 questoes/dia ate 1 de junho                │
│                                                  │
│  [ Batelada aleatoria (10 questoes) ]            │
└──────────────────────────────────────────────────┘
```

- Calculo: questoes restantes / dias ate 1 de junho de 2026
- Botao de batelada: gera sessao com 10 questoes aleatorias nao respondidas

**Navegacao por capitulo**

```
Parte 1
  Cap 1 — Onde e aqui?          ████░░ 18/27  (67%)
  Cap 2 — A agua que nao...     ██████ 27/27  (100%) ✓
  ...

Parte 2
  Cap 6 — Merda de ditadura     ██░░░░  6/27  (22%)
  ...
```

- Cada capitulo e clicavel, leva a `/painel/capitulo/[n]`
- Marcador visual para capitulos 100% completos

**Navegacao por subtopico**

```
  S1 Interpretacao de tema       ████░░ 32/57
  S2 Analise de personagem       ███░░░ 28/57
  ...
```

- Cada subtopico e clicavel, filtra questoes por subtopico

### 6. Sessao de questoes — versao paga (`/questoes/[sessionId]`)

- Mesmo layout da questao gratis, mas:
  - Sem limite de questoes
  - Mostra capitulo e subtopico no header
  - Progresso da sessao atual (ex: "Questao 4 de 10")
  - Ao final da sessao: resumo com acertos/erros e opcao de continuar

### 7. Tela de capitulo (`/painel/capitulo/[n]`)

- Lista todas as questoes do capitulo, agrupadas por subtopico
- Cada questao mostra: status (feita/nao feita), se acertou/errou
- Pode clicar para refazer ou fazer uma questao especifica
- Botao "Fazer todas as pendentes deste capitulo"

---

## Modelo de Dados (Prisma)

### Tabelas existentes (migrar do SQL atual)

```prisma
model Chapter {
  id        Int     @id @default(autoincrement())
  number    Int     @unique
  title     String
  part      Int     // 1, 2 ou 3
  lineStart Int     @map("line_start")
  lineEnd   Int     @map("line_end")

  chapterSubtopics ChapterSubtopic[]

  @@map("chapters")
}

model Subtopic {
  id          Int    @id @default(autoincrement())
  code        String @unique @db.VarChar(3)  // S1..S9
  name        String
  description String

  chapterSubtopics ChapterSubtopic[]

  @@map("subtopics")
}

model ChapterSubtopic {
  id         Int     @id @default(autoincrement())
  chapterId  Int     @map("chapter_id")
  subtopicId Int     @map("subtopic_id")
  viable     Boolean @default(true)

  chapter   Chapter  @relation(fields: [chapterId], references: [id])
  subtopic  Subtopic @relation(fields: [subtopicId], references: [id])
  questions Question[]

  @@unique([chapterId, subtopicId])
  @@map("chapter_subtopics")
}

model Question {
  id                Int     @id @default(autoincrement())
  chapterSubtopicId Int     @map("chapter_subtopic_id")
  questionNumber    Int     @map("question_number")

  stemQuote      String @map("stem_quote")
  stemQuotePage  String? @map("stem_quote_page")
  stemQuoteLines String? @map("stem_quote_lines")
  stemContext    String @map("stem_context")
  stemQuestion   String @map("stem_question")

  altA           String @map("alt_a")
  altB           String @map("alt_b")
  altC           String @map("alt_c")
  altD           String @map("alt_d")
  correctAnswer  CorrectAlt @map("correct_answer")

  bloom     BloomLevel
  status    QuestionStatus @default(draft)

  rejectionReason String? @map("rejection_reason")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @default(now()) @updatedAt @map("updated_at")

  chapterSubtopic ChapterSubtopic @relation(fields: [chapterSubtopicId], references: [id])
  userAnswers     UserAnswer[]

  @@unique([chapterSubtopicId, questionNumber])
  @@map("questions")
}

enum QuestionStatus {
  pending
  draft
  review
  approved
  rejected

  @@map("question_status")
}

enum BloomLevel {
  understand
  apply
  analyze
  evaluate

  @@map("bloom_level")
}

enum CorrectAlt {
  A
  B
  C
  D

  @@map("correct_alt")
}
```

### Tabelas novas

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified Boolean  @default(false) @map("email_verified")
  image         String?
  isPaid        Boolean  @default(false) @map("is_paid")
  paidAt        DateTime? @map("paid_at")
  stripePaymentId String? @map("stripe_payment_id")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @default(now()) @updatedAt @map("updated_at")

  sessions Session[]
  accounts Account[]
  answers  UserAnswer[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  accountId         String  @map("account_id")
  providerId        String  @map("provider_id")  // "google" | "apple"
  accessToken       String? @map("access_token")
  refreshToken      String? @map("refresh_token")
  accessTokenExpiresAt DateTime? @map("access_token_expires_at")
  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at")
  scope             String?
  idToken           String? @map("id_token")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime @map("expires_at")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @default(now()) @updatedAt @map("updated_at")

  @@map("verifications")
}

model UserAnswer {
  id         Int      @id @default(autoincrement())
  userId     String   @map("user_id")
  questionId Int      @map("question_id")
  selected   CorrectAlt
  isCorrect  Boolean  @map("is_correct")
  answeredAt DateTime @default(now()) @map("answered_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  question Question @relation(fields: [questionId], references: [id])

  @@unique([userId, questionId])  // 1 resposta por questao por usuario
  @@map("user_answers")
}
```

---

## API Routes (Next.js App Router)

### Publicas

| Rota                        | Metodo | Descricao                                  |
| --------------------------- | ------ | ------------------------------------------ |
| `GET /api/questions/count`  | GET    | Total de questoes aprovadas (para landing) |
| `GET /api/questions/sample` | GET    | 12 questoes da amostra gratis              |

### Autenticadas

| Rota                            | Metodo | Descricao                                 |
| ------------------------------- | ------ | ----------------------------------------- |
| `GET /api/questions`            | GET    | Questoes filtradas (capitulo, subtopico)  |
| `POST /api/answers`             | POST   | Registrar resposta do usuario             |
| `GET /api/progress`             | GET    | Progresso geral do usuario                |
| `GET /api/progress/chapter/[n]` | GET    | Progresso por capitulo                    |
| `POST /api/checkout`            | POST   | Criar sessao Stripe Embedded Checkout     |
| `POST /api/webhook/stripe`      | POST   | Webhook Stripe -> atualiza isPaid do user |

### Auth (Better Auth)

| Rota          | Descricao            |
| ------------- | -------------------- |
| `/api/auth/*` | Rotas do Better Auth |

---

## Stripe

### Conta sandbox (ja configurada)

| Recurso         | ID / Valor                                            |
| --------------- | ----------------------------------------------------- |
| Conta           | `acct_1T8UnfLY74tLYs1Z` (Ainda sandbox)               |
| Produto         | `prod_U6iGc8jYeBvIeu` — Pacote de Exercicios UERJ     |
| Preco promo     | `price_1T8UptLY74tLYs1Z8AJmSDEn` — R$ 24,90 one-time  |
| Preco cheio     | **A CRIAR** — R$ 49,00 one-time (para exibir riscado) |
| Publishable key | `pk_test_51T8Unf...` (sandbox)                        |
| Secret key      | `sk_test_51T8Unf...` (sandbox)                        |

### Modelo

- **Compra unica**: R$ 49,00 (preco cheio, exibido riscado)
- **Preco promocional**: R$ 24,90 (50% off ate 31/03/2026)
- **Integracao**: Stripe Embedded Checkout (`@stripe/react-stripe-js`)

### Fluxo de pagamento

1. Usuario clica CTA no dialog de upsell
2. Se nao logado, redireciona para `/login` com return URL
3. `POST /api/checkout` cria checkout session com `ui_mode: 'embedded'` usando `price_1T8UptLY74tLYs1Z8AJmSDEn`
4. Frontend renderiza `<EmbeddedCheckout>` inline na pagina `/checkout`
5. Apos pagamento, Stripe envia webhook `checkout.session.completed`
6. Webhook handler atualiza `user.isPaid = true` e `user.paidAt = now()`
7. Frontend redireciona para `/painel`

### Tarefas Stripe pendentes

- [ ] Criar preco cheio R$ 49,00 no Stripe (para referencia visual, nao para cobranca)
- [ ] Configurar webhook endpoint no Stripe Dashboard apontando para `/api/webhook/stripe`
- [ ] Obter webhook secret (`whsec_...`) e adicionar ao `.env`

---

## Estrutura de pastas

```
ainda-app/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, theme)
│   │   ├── page.tsx                # Landing page
│   │   ├── login/
│   │   │   └── page.tsx            # Tela de login
│   │   ├── questoes/
│   │   │   └── page.tsx            # Amostra gratis
│   │   ├── painel/
│   │   │   ├── layout.tsx          # Layout autenticado
│   │   │   ├── page.tsx            # Dashboard principal
│   │   │   ├── capitulo/
│   │   │   │   └── [n]/
│   │   │   │       └── page.tsx    # Detalhe do capitulo
│   │   │   └── sessao/
│   │   │       └── [id]/
│   │   │           └── page.tsx    # Sessao de questoes paga
│   │   ├── checkout/
│   │   │   └── page.tsx            # Embedded Stripe Checkout
│   │   └── api/
│   │       ├── auth/[...all]/
│   │       │   └── route.ts        # Better Auth handler
│   │       ├── questions/
│   │       │   ├── count/route.ts
│   │       │   └── sample/route.ts
│   │       ├── answers/route.ts
│   │       ├── progress/
│   │       │   ├── route.ts
│   │       │   └── chapter/[n]/route.ts
│   │       ├── checkout/route.ts
│   │       └── webhook/
│   │           └── stripe/route.ts
│   ├── components/
│   │   ├── ui/                     # shadcn components
│   │   ├── landing-hero.tsx        # Animacao "ainda estou aqui... estudando"
│   │   ├── question-card.tsx       # Card de questao reutilizavel
│   │   ├── question-option.tsx     # Alternativa individual
│   │   ├── progress-bar.tsx        # Barra de progresso
│   │   ├── upsell-dialog.tsx       # Dialog de upsell
│   │   ├── chapter-list.tsx        # Lista de capitulos com progresso
│   │   └── count-up.tsx            # Animacao de numero subindo
│   ├── lib/
│   │   ├── prisma.ts               # Singleton do Prisma Client
│   │   ├── auth.ts                 # Config Better Auth
│   │   ├── stripe.ts               # Config Stripe
│   │   └── utils.ts                # Helpers (cn, etc)
│   └── styles/
│       └── globals.css             # Tailwind + custom tokens
├── public/
│   └── textures/
│       └── grain.png               # Textura de papel (overlay)
├── .env.local                      # Segredos locais
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Variaveis de ambiente

```env
# Banco
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/ainda"

# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_CLIENT_SECRET="..."

# Stripe (sandbox — valores reais)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."  # preco promo R$24,90
STRIPE_PRICE_ID_FULL="price_..."                     # preco cheio R$49,00 (a criar)
```

> **Nota**: Em producao (Railway), trocar por chaves `pk_live_` / `sk_live_` e IDs de preco de producao.

---

## Fases de implementacao

### Fase 0 — Setup (~1h)

- [ ] Migrar de Vite para Next.js (manter deps existentes)
- [ ] Configurar Prisma com schema mapeando tabelas existentes
- [ ] `prisma db pull` para validar contra o banco local
- [ ] Configurar Tailwind v4 + tokens de cor/tipografia
- [ ] Setup fonte serifada (display) via next/font

### Fase 1 — Landing page

- [ ] Componente `LandingHero` com animacao palavra por palavra
- [ ] Componente `CountUp` para numero de questoes
- [ ] API route `GET /api/questions/count`
- [ ] Layout responsivo (mobile-first)
- [ ] Textura de fundo e polish visual

### Fase 2 — Amostra gratis

- [ ] API route `GET /api/questions/sample` (12 primeiras approved)
- [ ] Componente `QuestionCard` com selecao de alternativa
- [ ] Feedback visual correto/incorreto
- [ ] Navegacao entre questoes com progresso
- [ ] Limite de 5 questoes + trigger do dialog

### Fase 3 — Upsell dialog

- [ ] Componente `UpsellDialog` com precos e CTA
- [ ] Botao "nao obrigado" volta para ultima questao
- [ ] Botao de compra leva para login (se nao autenticado) ou checkout

### Fase 4 — Auth

- [ ] Configurar Better Auth (Google + Apple)
- [ ] Pagina `/login`
- [ ] Middleware de protecao para rotas `/painel/*`
- [ ] Tabelas User, Session, Account, Verification via Prisma

### Fase 5 — Stripe checkout

- [ ] Criar produto e precos no Stripe Dashboard
- [ ] API route `POST /api/checkout` (cria embedded session)
- [ ] Pagina `/checkout` com `<EmbeddedCheckout>`
- [ ] Webhook `checkout.session.completed` -> `user.isPaid = true`
- [ ] Testar fluxo completo com Stripe test mode

### Fase 6 — Painel pago

- [ ] Dashboard com progresso geral
- [ ] Calculo de questoes/dia ate 1 de junho
- [ ] Lista de capitulos com progresso individual
- [ ] Lista de subtopicos com progresso
- [ ] API routes de progresso

### Fase 7 — Sessoes de questoes pagas

- [ ] Filtro por capitulo e/ou subtopico
- [ ] Batelada aleatoria (10 questoes nao respondidas)
- [ ] `POST /api/answers` para registrar respostas
- [ ] Marcacao de questoes feitas vs. pendentes
- [ ] Tela de capitulo com detalhamento

### Fase 8 — Deploy (Railway)

Railway CLI autenticado. Projeto ja existe:

| Recurso  | Valor                                              |
| -------- | -------------------------------------------------- |
| Projeto  | **Ainda** (`e3ee43af-00a2-46ab-84d2-822481e02da3`) |
| Ambiente | production                                         |
| Servicos | Nenhum ainda (Postgres + app a provisionar)        |

```bash
# 1. Linkar repo ao projeto existente
railway link -p e3ee43af-00a2-46ab-84d2-822481e02da3

# 2. Provisionar Postgres
railway add --plugin postgresql

# 3. Configurar variaveis de ambiente
railway variables set BETTER_AUTH_SECRET="..."
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
railway variables set STRIPE_PRICE_ID="price_..."
railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
# ... demais vars (DATABASE_URL vem automatico do plugin Postgres)

# 4. Deploy
railway up

# 5. Rodar migrations no banco de producao
railway run npx prisma migrate deploy
railway run npx prisma db seed  # se tiver seed script
```

- [ ] `railway link` ao projeto Ainda
- [ ] Provisionar PostgreSQL no Railway
- [ ] Migrar schema + seed para banco de producao
- [ ] Configurar todas as variaveis de ambiente
- [ ] Primeiro deploy com `railway up`
- [ ] Gerar dominio publico (`*.up.railway.app`)
- [ ] Configurar webhook Stripe apontando para URL de producao
- [ ] Dominio customizado (futuro)

### Fase 9 — Polish

- [ ] Animacoes e transicoes refinadas
- [ ] Loading states e skeletons
- [ ] Tratamento de erros
- [ ] Meta tags e Open Graph
- [ ] Testes manuais do fluxo completo
- [ ] Monitorar webhook Stripe em producao
