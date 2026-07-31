# MAO Methodology - Elite Fitness Coaching Platform

A modern, AI-powered fitness coaching website built with Next.js 16, React 19, and Tailwind CSS 4.

## Features

- **13-Section SPA**: Hero, Services, Apply, Investment, Sample Split, AI Engine, Coach Jay, Proof, Gallery, Pay Invoice, + FAQ
- **Multi-Phase Application Form**: 4-phase form with progressive disclosure (pricing revealed after completion)
- **AI-Powered Engine**: Real-time Claude API integration for personalized fitness recommendations
- **Dark Operator Aesthetic**: Tactical dark navy, cyan, and amber color scheme
- **Responsive Design**: Mobile-first approach with full mobile menu support
- **Hash-Based Routing**: Smooth section navigation with anchor links

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Zod** - Schema validation
- **Anthropic Claude API** - AI-powered recommendations
- **Axios** - HTTP client

## Setup

### 1. Prerequisites

- Node.js 18+ and npm/yarn
- Anthropic API key (from https://console.anthropic.com)

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### 3. Environment Configuration

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Development

```bash
# Start dev server (runs on port 3002)
npm run dev
```

Visit http://localhost:3002 in your browser.

### 5. Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
mao-methodology/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── engine/
│   │           └── route.ts          # Claude API integration
│   ├── components/
│   │   ├── navbar.tsx                # Navigation (9 sections)
│   │   ├── footer.tsx                # Footer with links
│   │   ├── apply-form.tsx            # Multi-phase application form
│   │   └── ai-engine.tsx             # AI Engine UI component
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Main page with all 13 sections
│   └── globals.css                   # Global styles & operator aesthetic
├── tailwind.config.ts                # Theme configuration
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies

```

## Key Features Explained

### Multi-Phase Application Form

The application form guides users through 4 phases:
1. **Phase 1**: Basic information (name, email, phone)
2. **Phase 2**: Experience and goals (training level, fitness goals)
3. **Phase 3**: Diet and commitment (diet approach, weekly commitment)
4. **Phase 4**: Review - triggers pricing reveal

Pricing is hidden until all 4 phases are complete. This creates a smooth funnel that qualifies leads.

### AI Engine

The AI Engine endpoint (`/api/ai/engine`) provides real-time Claude API integration:

```typescript
POST /api/ai/engine
{
  "prompt": "What should my macros be for muscle building?"
}
```

Returns personalized fitness recommendations using Claude's capabilities.

### Dark Operator Aesthetic

The design uses a tactical dark theme:
- **Base**: Deep navy (`#0a0e27`)
- **Accents**: Cyan (`#22d3ee`) for primary, Amber (`#fbbf24`) for highlights
- **Grid patterns** and **glow effects** for visual depth
- **Smooth transitions** throughout

### Navigation

9 main sections accessible via hash routing:
- `#services` - What's included
- `#apply` - Application form
- `#investment` - Pricing packages
- `#sample-split` - Training split & macros
- `#ai-engine` - AI recommendations
- `#coach-jay` - Coach biography
- `#proof` - Client testimonials
- `#gallery` - Photo gallery
- `#pay-invoice` - Payment management

## CTA Copy (Exact as Required)

- `Apply for a Package` - Main application CTA
- `Run AI Powered Engine` - AI Engine submission button

## Deployment

### Vercel (Recommended)

```bash
# Deploy with Vercel CLI
vercel

# Or push to a connected GitHub repo and Vercel will auto-deploy
```

### Self-Hosted

```bash
# Build and start
npm run build
npm start

# Listen on port 3002
```

**Note**: Don't forget to set `ANTHROPIC_API_KEY` in your deployment environment.

## Development Notes

- All styles use Tailwind CSS utility classes with custom operator aesthetic classes
- Form validation uses Zod for type-safe schema validation
- AI Engine uses Claude Opus 5 for comprehensive fitness recommendations
- Mobile menu uses React state (`useState`) for hamburger toggle
- Smooth scrolling enabled with `scroll-behavior: smooth` in globals.css

## Future Enhancements

- Integrate with payment processor (Stripe, Paddle)
- Add client dashboard for progress tracking
- Connect to database for lead storage
- Email notifications for form submissions
- Video integration for coach messaging
- Analytics dashboard

## Support

For issues or questions about the MAO Methodology platform, contact Coach Jay.

## License

All rights reserved - MAO Methodology © 2026
