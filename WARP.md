# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

Repository: Hope International website/app built on Next.js + Supabase + Drizzle ORM.

What this file covers
- Essential commands for local dev, build, lint, typecheck, database, and project scripts
- How to run one-off checks (e.g., run a single security test function)
- High-level architecture so agents can navigate and modify the codebase effectively

Prerequisites and environment
- Copy .env.example to .env.local and set values
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY (for admin-only operations that require service role)
  - SUPABASE_PROJECT_ID (used by type generation)
  - SUPABASE_DB_URL (used by Drizzle to connect to the database)
  - RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_TO_EMAIL (for email delivery)
  - ADMIN_API_KEY, PUBLIC_API_KEY, INTEGRATION_API_KEY (if using API key–protected routes)
  - SEED_ADMIN_* (used by seed scripts)
  - NEXT_PUBLIC_SITE_URL

Common commands
- Install dependencies
  - npm ci
- Start dev server
  - npm run dev
- Lint
  - npm run lint
- Typecheck (no emit)
  - npx tsc --noEmit
- Build
  - npm run build
- Start production server (after build)
  - npm run start
- Generate Supabase types (writes to utils/supabase/database.types.ts)
  - npm run generate-types
    - Note: This uses a specific Supabase project-id in package.json. Update it if needed before running.
- Database (Drizzle ORM; requires SUPABASE_DB_URL)
  - Create a new migration from schema changes
    - npx drizzle-kit generate
  - Apply migrations to the database (push schema)
    - npx drizzle-kit push
- Seed database
  - npm run db:seed
- Security checks (API hardening smoke tests)
  - node scripts/test-api-security.js
  - Override target with TEST_BASE_URL, e.g.: TEST_BASE_URL=http://localhost:3000 node scripts/test-api-security.js
- Validate the user deletion system end-to-end (static checks + build + tsc)
  - tsx scripts/validate-user-deletion-system.ts

Running a single “test” or check
- There is no Jest/Vitest configured. To run a single check from the security script without editing it, invoke the exported function directly:
  - node -e "const t=require('./scripts/test-api-security.js'); t.testRateLimiting()"
  - node -e "const t=require('./scripts/test-api-security.js'); t.testInputValidation()"
  - node -e "const t=require('./scripts/test-api-security.js'); t.testAuthentication()"
  - node -e "const t=require('./scripts/test-api-security.js'); t.testCORS()"
  - node -e "const t=require('./scripts/test-api-security.js'); t.testSecurityHeaders()"

High-level architecture and flow

Tech stack
- Next.js 15 (App Router) with TypeScript
- Supabase (auth, storage) via @supabase/ssr and supabase-js
- Drizzle ORM (lib/db/schema/*) with PostgreSQL; migrations in drizzle/
- Tailwind CSS (v4) with shadcn/ui components
- Emails via Resend (lib/email/*)
- TanStack Query for client caching ergonomics

Routing and pages (app/)
- Public marketing pages (e.g., app/page.tsx, aboutus, courses, contactus) compose UI from components/*
- Auth flows under app/(auth-pages) and top-level sign-in/sign-up/forgot-password; dedicated admin auth under app/admin-auth/*
- Protected app sections under app/(protected)
  - Admin dashboard and resources (app/(protected)/admin/*): courses, categories, affiliations, intakes, enrollments, payments, refunds, users, customer-contact-requests
  - User area (app/(protected)/users/*): profile, enrollments, payment history
- API route handlers (app/api/*)
  - email/route.ts: contact form email endpoint, wrapped with API security middleware (rate limit, CORS, sanitization)
  - upload/route.ts, delete-image/route.ts: local file upload/delete to public/uploads with validation and basic path safety
  - auth/callback, auth/confirm: Supabase auth webhooks/flows

Middleware and access control
- Global middleware (middleware.ts)
  - Adds CORS headers for allowed origins
  - Delegates to updateSession from utils/supabase/middleware.ts
- utils/supabase/middleware.ts (updateSession)
  - Creates Supabase server client bound to request cookies
  - Determines user and role; enforces route-level access
    - Admin routes (/admin...) require Supabase role service_role; unauthenticated users redirected to /admin-auth/sign-in
    - User routes (/users...) require authenticated role; otherwise redirected to /sign-in
  - Auth routes (e.g., /sign-in, /sign-up, /admin-auth/*) are handled to avoid loops
- Role constants
  - service_role (admin), authenticated (regular users)

Supabase integration
- utils/supabase/client.ts: Browser client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- utils/supabase/server.ts: Server client (cookies) for server actions and route handlers
- utils/supabase/admin.ts: Admin client (service role) for privileged operations like user admin flows
- utils/supabase/middleware.ts: Session wiring and access control described above

Database and data modeling (Drizzle)
- Connection: lib/db/drizzle.ts uses SUPABASE_DB_URL
- Schemas: lib/db/schema/* define typed tables with relations and some pgPolicy rules; index.ts re-exports tables
- Migrations: drizzle/*.sql; configured by drizzle.config.ts (output dir ./drizzle)
- Zod validation: lib/db/drizzle-zod-schema/* provides runtime validation for server actions and API inputs

Server Actions (Next.js “use server”)
- Pattern: Validate input (Zod), check auth (requireAdmin or server Supabase getUser), perform DB changes via Drizzle, revalidate paths via next/cache as needed
- Admin examples
  - lib/server-actions/admin/courses.ts: Paginated listing, details, upsert with image storage via Supabase Storage, constraint checking for deletions, constraint checking for deletions
  - lib/server-actions/admin/course-categories.ts: Course category management
  - lib/server-actions/admin/users.ts: User listing and admin creation with Supabase admin API and Drizzle joins
  - lib/server-actions/admin/user-deletion.ts: Soft-delete, schedule deletion, restore with email notifications and audit trail
  - lib/server-actions/admin/customer-contact-reply.ts: Reply and batch reply workflows with Resend and persistence
  - lib/server-actions/admin/affiliations.ts: Affiliation management with constraint checking and pagination
- User examples
  - lib/server-actions/user/enrollments.ts: Enrollment creation with capacity checks, notifications, and profile lookups
  - lib/server-actions/user/customer-contact-requests.ts: Save contact requests and notify admins

API security layer (lib/api-security/*)
- middleware.ts exposes withApiSecurity(handler, config) wrapper providing:
  - CORS (per-route configuration)
  - Allowed methods enforcement
  - Rate limiting (global and per-action via lib/api-security/rate-limiter)
  - Optional API key validation
  - Input sanitization (XSS/SQLi patterns); places sanitized body on request
  - Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS in production)
- app/api/email/route.ts demonstrates usage with validation and action-level rate limiting

Email subsystem (lib/email/*)
- resend.ts + service.ts define sending helpers and templates
- Used by server actions (e.g., enrollments, contact replies, user deletion warnings)
- Requires RESEND_* environment variables

UI composition
- components/* contains:
  - Admin/*: tables, forms, dashboard cards, sidebar
  - Custom/*: shared UI for list views, filters, tables, skeletons
  - ui/*: shadcn/ui primitives wired with Radix components
  - Layout/* and SEO/* utilities
- Tailwind configured via tailwind.config.ts and postcss.config.mjs; app/globals.css applies base styles

SEO and images
- next.config.ts defines:
  - Remote image host allowlist (images, Unsplash, Supabase buckets, etc.)
  - Global security headers
  - Useful redirects and cache headers for static assets

Sitemaps and metadata
- app/sitemap.ts and sitemap-*.xml/; lib/seo/* for metadata, structured data, and Next.js 15 SEO helpers

Data seeding and helpers
- utils/db/seed.ts and lib/db/seed.ts seed base data (npm run db:seed uses utils/db/seed.ts)
- Environment-controlled seed admin fields (SEED_ADMIN_*)

Notes and gotchas
- If database schema changes, regenerate migrations (drizzle-kit) and re-run npm run generate-types to sync Supabase types used by SSR clients
- SUPABASE_DB_URL must be valid for any Drizzle operations (including seed scripts)
- Image uploads write to public/uploads; delete-image route enforces filename and path checks; client code should respect size/type limits
- Auth flows assume Supabase-managed cookies via @supabase/ssr; avoid mutating cookies between client creation and getUser in middleware

If you need more
- Add a test runner: If unit/e2e tests are desired, introduce Jest/Vitest/Playwright and wire scripts in package.json. Until then, prefer the provided scripts and typecheck/lint for fast feedback.

