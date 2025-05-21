# MySafety Construction Management Platform

## Overview

This is a comprehensive safety management platform for construction companies, featuring hazard reporting, inspections, permits, incident tracking, training management, and more. The application follows a modern web architecture with a React frontend and Express.js backend, using PostgreSQL for data storage with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React with TypeScript
- **UI Library**: Custom components built with Radix UI primitives and styled with Tailwind CSS
- **Routing**: Uses Wouter for client-side routing
- **State Management**: React Query for server state, React Context for application state
- **Form Handling**: React Hook Form with Zod for validation

### Backend Architecture

- **Framework**: Express.js with TypeScript
- **API Style**: RESTful API
- **Database Access**: Drizzle ORM for database queries and schema management
- **Authentication**: Session-based authentication with Passport.js
- **Email Services**: Nodemailer for email sending capabilities

### Database Design

- **ORM**: Drizzle ORM
- **Schema**: Multi-tenant design with comprehensive tables for users, tenants, sites, hazards, inspections, permits, incidents, training, etc.
- **Migrations**: Managed through Drizzle Kit

## Key Components

### Frontend Components

1. **Layout System**: Consistent layout with header, sidebar, and content areas
2. **Authentication**: Login, registration, and tenant registration forms
3. **Dashboards**: Role-specific dashboards with stats and quick actions
4. **Data Tables**: Reusable table component for data display with pagination
5. **Forms**: Form components for various data entry needs
6. **UI Component Library**: Comprehensive set of UI components based on Radix UI

### Backend Components

1. **API Routes**: Organized API endpoints for all platform features
2. **Authentication System**: User authentication and session management
3. **Storage Interface**: Abstraction for database operations
4. **Email Service**: Templated email sending capabilities
5. **Multi-Tenant Support**: Support for multiple companies/organizations

## Data Flow

1. **Authentication Flow**:
   - User logs in via the auth form
   - Credentials validated by the server
   - Session established and stored in PostgreSQL
   - User redirected to appropriate dashboard based on role

2. **Data Retrieval Flow**:
   - Components request data via React Query
   - Requests sent to backend API endpoints
   - Server validates the session and permissions
   - Data retrieved from database and returned as JSON
   - React Query caches the results for improved performance

3. **Data Submission Flow**:
   - Forms collect and validate user input
   - Data submitted to API endpoints
   - Server validates input using Zod schemas
   - Data saved to the database
   - UI updated via React Query invalidation

## External Dependencies

### Frontend Dependencies

- **@radix-ui/***: UI primitives for accessible components
- **@tanstack/react-query**: Data fetching and caching
- **wouter**: Lightweight routing
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Icon library

### Backend Dependencies

- **express**: Web server framework
- **drizzle-orm**: SQL query builder and ORM
- **@neondatabase/serverless**: PostgreSQL client for Neon database
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store
- **nodemailer**: Email sending capabilities

## Deployment Strategy

The application is configured for deployment on Replit with several key aspects:

1. **Build Process**:
   - Frontend is built using Vite
   - Backend is bundled with esbuild
   - Assets are served statically from the `dist/public` directory

2. **Environment Configuration**:
   - Requires `DATABASE_URL` environment variable
   - Optional email configuration via environment variables
   - Session secret configuration via environment variables

3. **Database Setup**:
   - PostgreSQL database provisioned through Replit
   - Schema migrations applied via Drizzle Kit

4. **Development Workflow**:
   - Development server with `npm run dev`
   - Production build with `npm run build`
   - Production start with `npm start`

## Getting Started

1. Ensure PostgreSQL database is provisioned
2. Set the `DATABASE_URL` environment variable
3. Run `npm install` to install dependencies
4. Run `npm run db:push` to apply database migrations
5. Run `npm run dev` to start the development server
6. Access the application at http://localhost:5000

## Project Structure

- `client/`: Frontend React application
- `server/`: Backend Express application
- `shared/`: Shared code between frontend and backend (schemas, types)
- `migrations/`: Database migration files

## Common Tasks

- **Adding a new feature**: Create components in `client/src/components`, add API routes in `server/routes.ts`, and update schemas in `shared/schema.ts` as needed
- **Database schema changes**: Update `shared/schema.ts` and run `npm run db:push` to apply changes
- **Adding UI components**: Follow the pattern in `client/src/components/ui/`
- **Authentication changes**: Modify `server/auth.ts` for backend and `client/src/hooks/use-auth.tsx` for frontend