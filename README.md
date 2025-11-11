<a href="https://hopeinternational.com.np/">
  <img alt="Hope International - Aged Care Training Center" src="/opengraph-image.png">
  <h1 align="center">Hope International Website</h1>
</a>

<p align="center">
  Educational institution website for Hope International in Nepal
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#setup"><strong>Setup</strong></a> ·
  <a href="#development"><strong>Development</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>
<br/>

## Features

- Next.js 15 with App Router
- Supabase Auth with cookie-based session management
- Supabase (PostgreSQL) with Drizzle ORM for migrations
- Tailwind CSS with shadcn/ui components
- React Query (TanStack Query) for server state management
- React Hook Form with Zod validation
- SEO optimization with structured data
- Responsive design for all device sizes

### Key Functionality

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

## Demo

You can view a fully working demo at [hopeinternational.com.np](https://hopeinternational.com.np/).

## Setup

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Clone the repository:

    ```bash
    git clone <repository-url>
    cd hope-international
    ```

3. Run the initialization script:

    ```bash
    ./init
    ```

    This script will:
    - Install all dependencies
    - Set up environment variables
    - Generate Supabase types
    - Run database migrations
    - Seed the database
    - Run type checking and linting

4. Update `.env.local` with your configuration values

## Development

To run the development server:

```bash
npm run dev
```

The application will be running on [localhost:3000](http://localhost:3000/).

### Development Commands

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

# Run type checking
npx tsc --noEmit
```

### Recent Improvements

#### Enrollment System Enhancement

The enrollment management system has been completely refactored to improve performance, maintainability, and developer experience. Key improvements include:

- Centralized type definitions for better type safety
- Optimized database queries with proper JOINs
- Standardized error handling with consistent response formats
- Separated business logic from data access logic
- Improved validation with Zod schemas
- Better caching strategies with React Query
- Backward compatibility for existing code

See [Enrollment System Improvement Summary](./docs/enrollment-system-improvement-summary.md) for complete details.

## Deployment

The application is designed for deployment on Vercel with Supabase integration. The Vercel deployment automatically configures environment variables from the Supabase project.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaugatdev%2Fhope-international&project-name=hope-international&repository-name=hope-international)

## More Information

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
