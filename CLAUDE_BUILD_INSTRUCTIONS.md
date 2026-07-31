# JayLeeFit Website Build Specification

## Project Scope

Build a professional coaching/intake website for JayLeeFit that:
- Showcases the coaching methodology (macro tracking + check-in system)
- Captures qualified leads via an intake form
- Connects intake data to the Airtable "JayLeeFit Client Hub" base
- Runs alongside the existing storefront (`Old Light` apparel) and content engine

## Architecture

```
jayleefit-website/          (NEW - this build)
├── app/
│   ├── page.tsx            (hero + value prop)
│   ├── about/page.tsx      (coach bio + methodology)
│   ├── intake/page.tsx     (lead capture form)
│   ├── success/page.tsx    (intake confirmation)
│   ├── api/intake/route.ts (write to Airtable)
│   └── layout.tsx
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── testimonial-card.tsx
│   ├── feature-block.tsx
│   └── intake-form.tsx
├── lib/
│   ├── airtable.ts         (API client)
│   └── form-validation.ts
├── package.json
└── .env.example
```

## Stack
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4** (consistent with storefront)
- **Airtable REST API** (direct write to Clients table)
- **Zod** (form validation, consistent with storefront)
- **React Hook Form** (form state management)

## Key Pages

### 1. Home (`/`)
- Hero section: "Transform your fitness through transparent macros + accountability"
- Problem/solution: typical coaching is a black box → this shows the exact system
- 3-column feature block: macro tracking, daily check-ins, progress metrics
- Testimonial carousel: real before/after transformations
- CTA: "Start Intake"

### 2. About (`/about`)
- Coach bio: Jay Lee
- Methodology: the macro loop (P/F/C, total kcal, daily reminder)
- How it differs from generic coaching
- Framework diagram showing Airtable → Telegram bot → App roadmap

### 3. Intake (`/intake`)
- Lead capture form:
  - Name, Email, Phone
  - Fitness goals (select: fat loss / muscle gain / performance / general health)
  - Current stats (weight, body measurements optional)
  - Availability/timezone
  - Budget expectation (optional)
- Zod validation
- Submits to `/api/intake` → writes to Airtable `Clients` table
- Redirects to `/intake/success` on completion

### 4. Success (`/intake/success`)
- Confirmation message
- Next steps (coach will reach out within 24h)
- Cross-promo to Old Light storefront (env var controlled)

## Airtable Integration

**Target:** `JayLeeFit Client Hub` base (`appN8QFsoWJ1fJhxC`)  
**Table:** `Clients`

**Fields populated by intake form:**
| Form Field | Airtable Field |
|---|---|
| Name | Name |
| Email | Email |
| Phone | Phone |
| Goals | Goals (multiselect) |
| Weight | (optional, Progress Tracking can be added later) |
| Timezone | (optional, if base supports it) |
| Status | "Intake Received" (default) |
| Date Added | Intake form submit timestamp |

**API Auth:** `Authorization: Bearer AIRTABLE_API_TOKEN`

## Environment Variables

```
AIRTABLE_API_TOKEN=pat_...
AIRTABLE_BASE_ID=appN8QFsoWJ1fJhxC
AIRTABLE_CLIENTS_TABLE=Clients
NEXT_PUBLIC_SITE_URL=https://jayleefit.com (for redirects)
NEXT_PUBLIC_SHOW_STOREFRONT_PROMO=true
NEXT_PUBLIC_STOREFRONT_URL=https://oldlight.shop (or env domain)
```

## Styling / Brand

- **Color scheme:** Professional fitness - dark backgrounds, accent colors (golds/cool blues)
- **Typography:** Modern sans-serif for body, strong serif for headlines (consistent with storefront aesthetic)
- **Tone:** transparent, data-driven, no hype — emphasize the *system* not the promises

## Deployment

- Vercel (same as storefront, zero-config)
- Custom domain (user brings their own)
- DNS + env var setup in Vercel dashboard

## Success Criteria

- [ ] Form captures and stores data in Airtable Clients table
- [ ] All pages render without errors
- [ ] Mobile responsive (Tailwind)
- [ ] Cross-promo to storefront configurable via env var
- [ ] Intake redirects to success page after submit
- [ ] Error handling for API failures (display user-friendly error)
- [ ] Dev server runs locally with sample/test data

## Stretch Goals (Phase 2)

- Testimonial section pulls real progress photos from Airtable Progress Tracking table
- Calendar integration (book an intro call)
- Email confirmation to the prospect
- Stripe payment for "technical training fee" (Phase 4 paid intake)
