# BribeMe updated 5/10/26/4.51 by Hugo, hosting attempt

Local Next.js demo backend for QR-based restaurant UGC reward campaigns.

## Run

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Environment

`.env` is git-ignored and should contain:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemini-3-flash-preview
```

## Backend Flow

1. Create a campaign with `POST /api/campaigns`.
2. Submit an image with `POST /api/submissions` as multipart form data.
3. The backend stores media under `data/uploads`, asks OpenRouter to validate the image against the challenge, and stores the scores.
4. Approved submissions receive a one-time reward code and create a draft social post caption.
5. The owner can approve the draft post locally.

## Useful Commands

```bash
npm run test
npm run build
npm run verify:llm
```

`npm run verify:llm` creates a local PNG fixture and calls OpenRouter against it.
