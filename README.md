# LifeLink AI

An AI-powered emergency healthcare and donation ecosystem connecting patients, donors, hospitals, and ambulance drivers in real time.

## Monorepo Structure

```
lifelink-ai/
├── client/    # Next.js 14 frontend
├── server/    # Node.js + Express backend
├── shared/    # Shared TypeScript types & constants
└── docs/      # Documentation
```

## Quick Start

```bash
# Install all dependencies
npm install

# Start development (client + server concurrently)
npm run dev

# Build for production
npm run build
```

## Environment Setup

Copy environment templates and fill in your keys:

```bash
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Redux Toolkit, Socket.IO Client
- **Backend:** Node.js 20, Express.js, Socket.IO, MongoDB, Redis
- **AI/ML:** Groq API, OpenAI API, face-api.js, Tesseract.js
- **Infrastructure:** Vercel (client), Render/Railway (server), MongoDB Atlas

See [claude.md](./claude.md) for full architecture documentation.
