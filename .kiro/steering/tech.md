# Technology Stack

## Framework & Runtime
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety
- **Node.js** runtime environment

## Database & ORM
- **Supabase** (PostgreSQL) for database and authentication
- **Drizzle ORM** for database operations and migrations
- **Drizzle Kit** for schema management and migrations

## Styling & UI
- **Tailwind CSS** for styling with custom configuration
- **shadcn/ui** component library built on Radix UI primitives
- **Framer Motion** for animations
- **Lucide React** and **Heroicons** for icons

## State Management & Data Fetching
- **TanStack Query (React Query)** for server state management
- **React Hook Form** with **Zod** validation for forms
- **nuqs** for URL state management

## Development Tools
- **ESLint** with Next.js and Prettier configurations
- **TypeScript** strict mode enabled
- **Turbopack** for faster development builds

## Common Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:seed         # Seed database with initial data
npm run generate-types  # Generate Supabase TypeScript types

# Type Checking
npx tsc --noEmit        # Run TypeScript compiler without output
```

## Environment Variables
- Supabase configuration (URL, keys, project ID)
- Email service (Resend API)
- API security keys for different access levels
- Admin seeding credentials