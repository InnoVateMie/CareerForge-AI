# CareerForge AI

## Overview

CareerForge AI is a SaaS web application that serves as an AI-powered Resume & Job Application Builder. Users can generate professional resumes and cover letters using AI (OpenAI), edit them with a rich text editor, export to PDF, and optimize their resumes against specific job descriptions. The app uses Replit Auth for authentication and follows a monorepo structure with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project is organized into three main directories:
- **`client/`** — React frontend (SPA)
- **`server/`** — Express backend (API server)
- **`shared/`** — Shared types, schemas, and route definitions used by both client and server

### Frontend
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Uses `wouter` (lightweight client-side router), not React Router
- **State Management**: TanStack React Query for server state; no global client state library
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, styled with Tailwind CSS
- **Rich Text Editing**: Tiptap editor for editing AI-generated resumes and cover letters
- **PDF Export**: `html2pdf.js` for client-side DOM-to-PDF conversion
- **3D Landing Page**: Three.js via `@react-three/fiber` and `@react-three/drei` for particle background animation
- **Animations**: Framer Motion for page transitions and UI animations
- **Forms**: `react-hook-form` with `@hookform/resolvers` for Zod validation
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Framework**: Express.js running on Node.js with TypeScript (via `tsx`)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Route Definitions**: Centralized in `shared/routes.ts` with Zod schemas for input validation and response types
- **AI Integration**: OpenAI API (via Replit AI Integrations environment variables) for generating resumes, cover letters, and job optimization analysis
- **Build**: esbuild for server bundling, Vite for client bundling (orchestrated by `script/build.ts`)
- **Development**: Vite dev server with HMR proxied through Express in dev mode

### Authentication
- **Method**: Replit Auth (OpenID Connect) — NOT custom JWT auth
- **Session Storage**: PostgreSQL-backed sessions via `connect-pg-simple`
- **User Flow**: Users click "Sign In" which redirects to `/api/login`; no custom signup/login forms
- **Auth Hook**: `useAuth()` on the client checks `/api/auth/user` endpoint
- **Protected Routes**: Server middleware `isAuthenticated` guards API endpoints; client-side `DashboardLayout` redirects unauthenticated users

### Database
- **Database**: PostgreSQL (required, provisioned via Replit)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` and `shared/models/` directory
- **Migrations**: Managed via `drizzle-kit push` (no migration files checked in by default)
- **Key Tables**:
  - `users` — User profiles (Replit Auth managed)
  - `sessions` — Session storage (Replit Auth managed)
  - `resumes` — User resumes with title and content (HTML string)
  - `cover_letters` — User cover letters with title and content
  - `conversations` / `messages` — Chat storage (from Replit integrations, may not be actively used)

### Storage Pattern
- `server/storage.ts` defines an `IStorage` interface and `DatabaseStorage` implementation
- All database operations go through this storage layer, making it easy to swap implementations
- Data is scoped per user via `userId` filtering on all queries

### AI Content Flow
1. User fills out a form (resume details, cover letter info, or job optimization inputs)
2. Frontend sends structured data to an API endpoint
3. Server constructs a prompt and calls OpenAI API
4. AI response (Markdown) is returned to the client
5. Client converts Markdown to HTML using `marked`
6. HTML is loaded into the Tiptap rich text editor for user editing
7. User can save (to database) or export (to PDF via `html2pdf.js`)

### Replit Integrations
The `server/replit_integrations/` and `client/replit_integrations/` directories contain pre-built modules:
- **auth/** — Replit Auth setup (passport + OpenID Connect)
- **chat/** — Conversation/message CRUD and AI chat streaming
- **audio/** — Voice recording, playback, and streaming utilities
- **image/** — Image generation via OpenAI
- **batch/** — Batch processing with rate limiting and retries

These are infrastructure modules — do not delete the auth-related tables or modules.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable. Must be provisioned.
- **OpenAI API**: Connected via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables (Replit AI Integrations)
- **Replit Auth**: Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — Database ORM and migrations
- `openai` — OpenAI API client
- `express` + `express-session` — HTTP server and sessions
- `passport` + `openid-client` — Authentication
- `connect-pg-simple` — PostgreSQL session store
- `@tanstack/react-query` — Client-side data fetching
- `@tiptap/react` + `@tiptap/starter-kit` — Rich text editor
- `html2pdf.js` — PDF export
- `marked` — Markdown to HTML conversion
- `zod` — Schema validation (shared between client and server)
- `wouter` — Client-side routing
- `framer-motion` — Animations
- `three` + `@react-three/fiber` + `@react-three/drei` — 3D graphics