# Hope International Website - Project Context

## Project Overview

This is a Next.js 15 application for Hope International, an educational institution in Nepal that provides caregiver training packages. The website serves as both a public-facing platform to showcase courses and services, and a portal for students and administrators to manage enrollments, payments, and other educational services.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Supabase Auth with cookie-based session management
- **Database**: Supabase (PostgreSQL) with Drizzle ORM for migrations
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Vercel (with Supabase integration)

## Project Structure

```
app/                    # Next.js app router pages and layouts
components/             # Reusable UI components (shadcn/ui and custom)
lib/                    # Business logic, utilities, and data access layers
utils/                  # Utility functions and Supabase client configurations
drizzle/                # Database migrations
public/                 # Static assets
```

## Key Features

1. **Public Website**:
   - Homepage with hero section, services, courses overview
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

## Authentication & Authorization

The application uses Supabase Auth with a custom middleware for session management:

- **Roles**:
  - `authenticated`: Regular users (students)
  - `service_role`: Administrators

- **Protected Routes**:
  - `/admin/*`: Admin-only routes
  - `/users/*`: Authenticated user routes
  - Public routes available to all visitors

## Database Schema

The database uses Drizzle ORM for migrations and includes tables for:
- Courses and course categories
- User profiles and enrollments
- Payments and refunds
- Intakes and schedules
- Customer contact requests and replies
- Affiliations

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Generate Supabase types
npm run generate-types

# Seed database
npm run db:seed
```

## Environment Variables

Required environment variables are defined in `.env.example`:
- Supabase connection details
- Resend email configuration
- API keys for security
- Site URL configuration

## Styling System

The project uses:
- Tailwind CSS for utility-first styling
- shadcn/ui components built on Radix UI primitives
- Custom theme configuration in `tailwind.config.ts`
- CSS variables for theming support

## Data Management

- React Query for server state management
- Custom query keys defined in `lib/query-keys.ts`
- Supabase client/server configurations in `utils/supabase/`
- Drizzle ORM for database schema and migrations

## Recent Improvements

### Affiliation Management System
A new affiliation management system has been implemented for admin users with the following features:
- CRUD operations for affiliations (create, read, update, delete)
- Form validation using Zod schemas
- Constraint checking to prevent deletion of affiliations referenced by courses
- Integration with course management system
- Dedicated admin UI with listing, creation, and editing capabilities

### Course Management System Enhancements
The course management system has been significantly improved with:
- Standardized naming conventions across all files
- Improved type safety with centralized TypeScript types
- Optimized image handling through dedicated utility functions
- Constraint checking before course deletion (prevents deletion of courses referenced by intakes or enrollments)
- Standardized error handling across all server actions
- Refactored hooks for consistency with the affiliation management system
- Better pagination, filtering, and sorting capabilities

### Code Quality Improvements
- Removed redundant utility functions
- Centralized extended types for better type safety
- Updated documentation in WARP.md
- Consistent error handling patterns across the codebase

## Deployment

The application is designed for deployment on Vercel with Supabase integration. The Vercel deployment automatically configures environment variables from the Supabase project.