# CarDoctor — AI Car Inspection Platform

CarDoctor is an AI-powered car inspection assistant built with Next.js. Users can chat about cars, ask maintenance questions, upload damage photos, and receive AI vision analysis with repair recommendations and cost estimates.

## Features

- **AI Car Expert Chat** — Ask about car models, specs, common issues, and maintenance
- **Damage Image Analysis** — Upload JPG, PNG, or WEBP photos for AI vision inspection
- **Structured Reports** — Vehicle identification, damage detection, repair advice, and cost estimates
- **Booking Flow** — CTA links with a booking confirmation modal
- **Responsive UI** — Optimized for mobile, tablet, and desktop
- **Chat History** — Messages persist in the browser session

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [OpenAI SDK](https://platform.openai.com/docs) (GPT-4o Vision + GPT-4o-mini)
- [React Markdown](https://github.com/remarkjs/react-markdown)

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # OpenAI API route (server-side)
│   ├── chatbot/page.tsx     # Main AI chat page
│   ├── inbox/page.tsx       # Redirects to /chatbot
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   ├── chatbot/
│   │   ├── ChatBot.tsx      # Main chat container
│   │   ├── ChatBubble.tsx   # Message bubbles
│   │   ├── ChatInput.tsx    # Input + image upload
│   │   ├── TypingIndicator.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── BookingSuccessModal.tsx
│   ├── ContactBar.tsx
│   ├── LandingPage.tsx
│   ├── LoadingPage.tsx
│   ├── SocialLinks.tsx
│   └── Footer.tsx
├── lib/
│   ├── constants.ts         # Brand config & social links
│   ├── openai.ts            # System prompts & model config
│   └── utils.ts
└── types/
    └── chat.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ScannoUpadate

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local` with your values:

```env
OPENAI_API_KEY=sk-your-openai-api-key

NEXT_PUBLIC_CAR_DOCTOR_WEBSITE=https://cardoctor.example.com
NEXT_PUBLIC_CAR_DOCTOR_PHONE=+8801XXXXXXXXX
NEXT_PUBLIC_CAR_DOCTOR_BOOKING_URL=https://cardoctor.example.com/book
NEXT_PUBLIC_CURRENCY_SYMBOL=৳
```

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (server-side only) |
| `NEXT_PUBLIC_CAR_DOCTOR_WEBSITE` | Brand website URL |
| `NEXT_PUBLIC_CAR_DOCTOR_PHONE` | Contact phone number |
| `NEXT_PUBLIC_CAR_DOCTOR_BOOKING_URL` | Booking page URL |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Currency symbol for repair estimates |

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/chatbot` | AI chat & image analysis |
| `/inbox` | Redirects to `/chatbot` |
| `/api/chat` | OpenAI API endpoint (POST) |

## Usage Examples

**Car information:**
> Tell me about Toyota Corolla 2020

**Damage analysis:**
> Upload a photo of a dented bumper or scratched door

The AI returns:
1. Car identification
2. Detected damage
3. Problem explanation
4. Repair recommendation
5. Estimated repair cost

Each response ends with CarDoctor contact details and booking links.

## AI Models

| Use Case | Model |
|----------|-------|
| Text chat | `gpt-4o-mini` |
| Image analysis | `gpt-4o` (Vision) |

Configured in `src/lib/openai.ts`.

## E2E Testing (Playwright)

End-to-end tests cover the landing page, chatbot UI, inbox redirect, booking modal, social links, and API validation.

### Local (production build)

```bash
npm run test:e2e
```

This builds the app, starts it on port `3005`, and runs tests in Chromium + mobile Chrome.

### Against Vercel deployment

```bash
PLAYWRIGHT_BASE_URL=https://your-app.vercel.app npm run test:e2e:vercel
```

Replace `your-app.vercel.app` with your live Vercel URL.

### Useful commands

```bash
npm run test:e2e:ui          # Interactive Playwright UI
npx playwright show-report   # View HTML report after a run
```

### What is tested

- CarDoctor branding and CTAs on landing page
- Feature cards and root social links (Facebook, Instagram, WhatsApp)
- Booking modal from contact bar
- Navigation to `/chatbot` and `/inbox` redirect
- Chat welcome message, input, send button, clear chat
- `POST /api/chat` returns 400 for empty messages

## Deploy on Vercel

1. Push the project to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy

Make sure `OPENAI_API_KEY` is set in Vercel project settings — never commit it to git.

## Security Notes

- Keep `OPENAI_API_KEY` in `.env.local` only (already in `.gitignore`)
- Do not expose API keys in client-side code
- The `/api/chat` route handles all OpenAI requests server-side

## License

Private project.
