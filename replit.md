# Vera Hiring Tracker

## Overview

Full-stack enterprise HR hiring tracker built for Vera. pnpm workspace monorepo with a React+Vite frontend, Express 5 backend, and PostgreSQL database.

## Stack

- **Monorepo**: pnpm workspaces, TypeScript 5.9, Node.js 24
- **Frontend**: React + Vite + Wouter + Shadcn/UI (artifact: `hiring-tracker`)
- **Backend**: Express 5 + Drizzle ORM + PostgreSQL (artifact: `api-server`)
- **Auth**: Clerk (`@clerk/react`, `@clerk/express`) — falls back to no-auth mode if `VITE_CLERK_PUBLISHABLE_KEY` is not set
- **API codegen**: Orval (from OpenAPI spec → `@workspace/api-client-react` hooks)
- **AI**: OpenAI GPT for CV analysis (`@workspace/integrations-openai-ai-server`)
- **Storage**: local filesystem en Docker para CVs (`CV_STORAGE_PROVIDER=local`), con opcion futura de migrar a S3/MinIO
- **Email**: Resend for notifications (graceful fallback if `RESEND_API_KEY` not set)
- **Build**: esbuild (ESM bundle for API)

## Features

### HR App (Protected — requires Clerk sign-in)
- **Dashboard** — metrics, pipeline overview, recent activity, upcoming interviews
- **Candidates** — list, filter by stage/status, add new candidates
- **Candidate Detail** — profile, stage management, CV upload, AI-powered CV analysis, interviews, feedback/scores
- **Positions** — open/closed job positions with headcount, department, location
- **Position Detail** — candidates per position, open rate, pipeline stats
- **Interviews** — schedule & track interviews across all candidates
- **Feedback** — structured feedback forms with star ratings and hiring recommendations

### Public Careers Portal (No auth required)
- **`/portal`** — branded BBVA careers page with open position listings and search
- **`/portal/:id`** — position detail + application form (name, email, phone, CV upload, cover letter)
- Applications go directly into the candidates pipeline

### Auth
- **`/sign-in`** and **`/sign-up`** — branded Clerk authentication pages (BBVA theme)
- Sidebar "Careers Portal" link + "Sign out" button
- `Show` component pattern (Clerk v6 compatible — no `SignedIn`/`SignedOut`)

### Notifications (Email via Resend)
- Stage change notifications sent to candidates when moved in pipeline
- Offer extended notification
- Interview scheduled notification
- All notifications have graceful fallback (log only) if `RESEND_API_KEY` not set

### CV & AI Analysis
- Upload PDF/Word CV files (almacenados en volumen local Docker en el estado actual)
- Paste CV text → AI analysis via GPT: summary, years of experience, top skills, education, strengths, areas to explore, financial-services fit score, recommended next step
- Analysis stored in `candidates.cv_analysis` (JSON string)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Key Files

- `artifacts/hiring-tracker/src/App.tsx` — ClerkProvider + all routes (HRLayout/ProtectedRoute wrap children with `<AccessGate>`)
- `artifacts/hiring-tracker/src/components/AccessGate.tsx` — calls `/api/access/check`; shows "Acceso denegado…" + sign-out when email not in allowlist
- `artifacts/hiring-tracker/src/components/Layout.tsx` — sidebar nav with portal link
- `artifacts/hiring-tracker/src/pages/Portal.tsx` — public careers portal
- `artifacts/hiring-tracker/src/pages/ApplyPage.tsx` — public application form
- `artifacts/hiring-tracker/src/pages/CandidateDetail.tsx` — includes CvSection component
- `artifacts/api-server/src/routes/cv.ts` — CV upload + OpenAI analysis endpoints
- `artifacts/api-server/src/routes/access.ts` — `/api/access/check|status|reload` (Clerk-authenticated; uses session email, ignores spoofable params)
- `artifacts/api-server/src/middlewares/requireAllowedEmail.ts` — gates all HR business APIs (positions, candidates, interviews, feedback, dashboard, cv) behind allowlist
- `artifacts/api-server/src/lib/allowedEmails.ts` — Google Sheets fetcher with 5-min cache and CSV fallback (`data/allowed-emails.csv`)
- `artifacts/api-server/data/allowed-emails.csv` — portable fallback (Docker volume mount target) extracted from sheet "lista de alumnos" (sheet id `1V_IHJn3ZAyVMdJo9oX3skYt2xunid37naSRN3_L2ohs`, column F)
- `artifacts/api-server/src/routes/portal.ts` — public API for positions + apply
- `artifacts/api-server/src/lib/notify.ts` — Resend email notification service
- `artifacts/api-server/src/routes/candidates.ts` — CRUD + stage-change email notify
- `artifacts/api-server/src/routes/interviews.ts` — CRUD + interview-scheduled email notify
- `lib/db/src/schema/candidates.ts` — includes `cv_path`, `cv_analysis` columns

## DB Schema Tables
- `candidates` — id, firstName, lastName, email, phone, positionId, stage, status, source, rating, cvPath, cvAnalysis, notes
- `positions` — id, title, department, location, type, status, headcount, description
- `interviews` — id, candidateId, type, scheduledAt, durationMinutes, interviewerName, location, status
- `feedback` — id, candidateId, interviewId, rating, recommendation, strengths, concerns, notes
- `activity` — id, type, description, candidateName, positionTitle, createdAt

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (optional, enables auth)
- `CLERK_SECRET_KEY` — Clerk secret key (API server auth)
- `RESEND_API_KEY` — Resend email API key (optional, enables email notifications)
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` — bucket S3-compatible (solo si no usas storage local)
- `ALLOWED_EMAILS_SHEET_ID` (optional) — override Google Sheet ID for allowlist
- `ALLOWED_EMAILS_SHEET_NAME` (optional, default "lista de alumnos") — tab name within the sheet
- `ALLOWED_EMAILS_COLUMN_HEADER` (optional, default "email") — header of the email column

## Email Allowlist
Only emails on the Google Sheet (currently 32 entries from "lista de alumnos") may sign in/up. Backend enforces via `requireAllowedEmail` middleware on `/api/positions|candidates|interviews|feedback|dashboard|cv`. `/api/portal/*` and `/api/healthz` stay public. Cache refreshes every 5 min; if the sheet is unreachable the CSV fallback is used. Public Clerk sign-in is allowed but the app immediately shows "Acceso denegado, sólo los usuarios del Laboratorio 7 de IA Generativa - IE pueden registrarse e iniciar sesión." with a sign-out button when the email is not on the list.

## Contexto de este repositorio

Este proyecto nace como una refactorizacion de un prototipo inicial en Replit. Actualmente se trabaja en local con Docker y GitHub como fuente principal.
