# Talk2TheMachine

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Groq Chat PoC

This app now uses a direct `fetch` call to Groq's OpenAI-compatible endpoint in [app/api/chat/route.ts](app/api/chat/route.ts).

- Model: `llama-3.1-8b-instant` (Llama 3 on Groq free tier)
- Auth: `Authorization: Bearer <GROQ_API_KEY>`
- Headers: `Content-Type: application/json`
- Request handling: `async/await`

Per assistant response, the UI shows:

- Token usage (`input`, `output`, `total`)
- Response time (ms)
- Estimated cost (USD)

Session totals in the right sidebar aggregate all conversation threads.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_UgPTLSsg0LNZn6uRBIDbyqgJZXpl)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
