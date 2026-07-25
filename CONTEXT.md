# LiU Tentor — Project Context & Developer Guide

Welcome! This document provides an architectural overview, tech stack breakdown, and key development guidelines for **LiU Tentor**. AI agents and human developers should consult this file before making changes.

---

## Package Manager & Commands

> [!IMPORTANT]
> **Package Manager**: This project uses **Bun**. Always prefer `bun` commands over `npm`/`yarn`/`pnpm`.

```bash
# Install dependencies
bun install

# Start local development server
bun run dev

# Production build
bun run build

# Preview production build locally
bun run preview
```

---

## Project Overview

**LiU Tentor** is a web application for students at Linköping University (LiU) to search, study, view, and analyze past university exams (*tentor*) and solutions (*facit*). Key features include:
- **Course & Exam Search**: Instant search and filtering for LiU course codes and exam dates.
- **Dual PDF Viewer**: Side-by-side interactive PDF viewing for exams and official solutions using WASM.
- **AI Study Assistant**: Chat tutor integrated with exam context for explaining solutions and answering questions.
- **Quiz & Lock-in Mode**: Timer-focused practice mode and AI-generated practice quizzes.
- **Grade & Pass Rate Analytics**: Visual charts showing pass rate trends and grade distributions.

---

## Technology Stack

| Layer | Technology | Usage / Details |
| :--- | :--- | :--- |
| **Framework** | **Nuxt 4** + **Vue 3** | Nuxt 4 directory structure under `app/` and `server/` |
| **Package Manager** | **Bun** | `bun.lock` in root |
| **Language** | **TypeScript** | Strict mode enabled |
| **Styling** | **Tailwind CSS v4** | `@tailwindcss/vite`, `@tailwindcss/typography`, `tailwindcss-animate` |
| **UI Components** | **Shadcn Nuxt** (`reka-ui`) | Accessible UI primitives in `app/components/ui/` |
| **Icons** | **Lucide Icons** (`nuxt-lucide-icons`) | `<LucideIconName />` auto-imported components |
| **PDF Rendering** | **@embedpdf** | PDFium WASM engine (`pdfium.wasm`) |
| **Database & Auth** | **Supabase** (`@nuxtjs/supabase`) | Authentication & user profiles |
| **Backend API** | **Go Microservice** (Cloud Run) | Proxied via Nitro API routes (`/api/exams/**`) |
| **Code & TeX Math** | **Shiki** + **KaTeX** + `texmath` | Code syntax highlighting & LaTeX formula rendering |
| **Analytics & Charts**| **Chart.js** + **vue-chartjs** | Pass rates & grade distribution graphs |

---

## Directory Structure

```
liutentor-nuxt/
├── app/                        # Nuxt 4 application root
│   ├── assets/css/             # Tailwind CSS & custom utility styles (tailwind.css)
│   ├── components/             # Reusable Vue components
│   │   ├── ui/                 # Shadcn UI primitives (Button, Dialog, Tabs, Badge, etc.)
│   │   ├── ChatWindow.vue      # AI chat tutor interface
│   │   ├── CourseStats.vue     # Chart.js statistics component
│   │   ├── ExamHeader.vue      # Exam view top bar & date selector dropdown
│   │   └── PdfRenderer.vue     # EmbedPDF WASM PDF viewer wrapper
│   ├── composables/            # Custom Vue composables (useChat, useLockInMode, etc.)
│   ├── constants/              # App constants (avatar colors, options)
│   ├── layouts/                # Nuxt layouts (default, search, info, profile, auth)
│   ├── pages/                  # File-system routing
│   │   ├── index.vue           # Main homepage search
│   │   ├── search/[courseCode]/# Course exams table & stats
│   │   ├── lock-in/[examId].vue# Focused timer study mode
│   │   └── quiz/               # AI quiz generator & practice
│   ├── stores/                 # Pinia stores (chat, layout, quiz)
│   └── types/                  # TypeScript interface definitions
├── public/                     # Static assets (fonts, logo, manifest)
│   └── fonts/                  # Custom webfonts (GitLabSansVF.woff2, GT-Super-Text-Bold.otf)
├── server/                     # Nitro server engine
│   ├── api/                    # Server API endpoints & Go backend proxies
│   └── routes/                 # Dynamic server routes (sitemap.xml)
├── nuxt.config.ts              # Main Nuxt & Nitro configuration
├── bun.lock                    # Bun lockfile
└── package.json                # Project dependencies and scripts
```

---

## Important Conventions & Guidelines

1. **Package Manager**: Always use `bun` (`bun install`, `bun run dev`, `bun run build`).
2. **Lazy Loading Heavy Modules**:
   - Heavy modules (`@embedpdf`, `chart.js`, `katex`, `shiki`) MUST be code-split into dynamic lazy components (`<LazyPdfRenderer>`, `<LazyCourseStats>`, `<LazyChatWindow>`) so initial page bundles stay small (<200KB).
3. **Auth Components & Hydration**:
   - Wrap auth-dependent controls (`useSupabaseUser()`) inside `<ClientOnly>` (e.g. `AuthActions.vue`) to prevent Vue 3 SSR hydration mismatches between server-cached HTML and client user sessions.
4. **Icons**:
   - Use `nuxt-lucide-icons` auto-imported icon components (e.g. `<LucideSearch />`, `<LucideUpload />`, `<LucideCheck />`). Do not manually import from `lucide-vue-next` unless strictly necessary.
5. **Nitro Edge Caching (`routeRules`)**:
   - Static pages (`/om-oss`, `/faq`, `/ai-policy`, `/copyright-policy`, `/privacy-policy`) use `prerender: true`.
   - Course pages (`/search/**`), home (`/`), and API endpoints (`/api/exams/**`) use Stale-While-Revalidate (`swr: 3600`).
6. **Fonts**:
   - Main sans font `/fonts/GitLabSansVF.woff2` is preloaded in `nuxt.config.ts` and configured with `font-display: swap;` in `tailwind.css`.
