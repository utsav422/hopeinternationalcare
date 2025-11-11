# Qwen Code Context for Hope International Website

## Project Overview

The Hope International Website is an educational institution website for Hope International in Nepal, built with Next.js 15. It features a comprehensive system for course management, user authentication, and administrative controls. The project uses Supabase for authentication and database management, with Drizzle ORM for database migrations and Zod for validation.

## Architecture & Technologies

- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth with cookie-based session management
- **Database**: Supabase (PostgreSQL) with Drizzle ORM for migrations
- **State Management**: React Query (TanStack Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React and Heroicons
- **Deployment**: Designed for Vercel with Supabase integration

## Key Features

1. **Public Website**:
    - Homepage with hero section, services, and courses overview
    - Course catalog with detailed pages
    - Contact forms and request handling
    - SEO optimization with structured data

2. **Authentication System**:
    - Separate authentication flows for users and administrators
    - Role-based access control (authenticated users vs service_role admins)
    - Password reset and setup functionality

3. **Admin Panel**:
    - Course management (categories, courses, affiliations, intakes)
    - Enrollment and payment tracking
    - Customer contact request management
    - User profile management
    - Affiliation management system

4. **User Portal**:
    - Profile management
    - Enrollment tracking
    - Payment history

## File Structure

```
hope-international/
├── app/                    # Next.js app router pages
├── components/             # React components (Admin, Custom, Layout, SEO, UI, User)
├── lib/                    # Library functions and utilities
├── utils/                  # Utility functions (including Supabase utilities)
├── hooks/                  # Custom React hooks
├── drizzle/               # Database migration files
├── public/                # Static assets
├── .env.example           # Environment variables template
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Building and Running

### Prerequisites

- Node.js (version compatible with the project)
- A Supabase project

### Setup

1. Clone the repository
2. Run the initialization script:

```bash
./init
```

This script will install dependencies, set up environment variables, generate Supabase types, run database migrations, seed the database, and run type checking and linting.

3. Update `.env.local` with your configuration values

### Development Commands

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Generate Supabase types
npm run generate-types

# Seed database
npm run db:seed

# Run type checking
npx tsc --noEmit
```

## Key Configuration Files

### next.config.ts

Contains Next.js configuration including:

- React strict mode and compression settings
- Image optimization with remote patterns for various domains
- Security headers (CSP, XSS protection)
- SEO redirects for paths like `/home` → `/`, `/course/:slug` → `/courses/:slug`, etc.

### middleware.ts

Handles:

- CORS configuration for allowed origins
- Supabase session updates
- Request routing with specific matcher patterns

### drizzle.config.ts

Database configuration for:

- PostgreSQL dialect
- Schema location (`./lib/db/schema/*.ts`)
- Database credentials from environment variables

## Environment Variables

The project requires the following environment variables (refer to `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_PROJECT_ID` - Supabase project ID
- `RESEND_API_KEY` - For email functionality
- Various other API keys and configuration values

## Development Conventions

- Uses TypeScript for type safety
- Implements component-based architecture with shadcn/ui
- Follows Next.js 15 App Router patterns
- Uses Zod for schema validation
- Implements React Query for data fetching and caching
- Employs modern CSS with Tailwind and custom components
- Includes comprehensive error handling and validation
- Implements SEO best practices with structured data
- Responsive design for all device sizes

## Special Notes

The application includes a recently refactored enrollment management system that has been enhanced for improved performance, maintainability, and developer experience with:

- Centralized type definitions
- Optimized database queries with proper JOINs
- Standardized error handling
- Separated business logic from data access logic
- Improved validation with Zod schemas
- Better caching strategies with React Query
- Backward compatibility for existing code
