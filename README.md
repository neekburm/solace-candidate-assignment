## Solace Candidate Assignment

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

## Database set up

1. Start the database

```bash
docker compose up -d
```

2. Push migration to the database

```bash
npx drizzle-kit push
```

3. With the dev server still running, seed the database

```bash
curl -X POST http://localhost:3000/api/seed
```

