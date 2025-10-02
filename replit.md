# Overview

This is a comprehensive business accounting software built as a full-stack web application. The system manages core business operations including sales, purchases, inventory, customers, suppliers, expenses, and financial reporting. It's designed for small to medium businesses with features like VAT calculation, invoice management, staff roles, and comprehensive reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript throughout for type consistency between frontend and backend
- **Development**: tsx for running TypeScript directly in development
- **Production Build**: esbuild for fast, optimized server bundling

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Type Safety**: Full TypeScript integration from database schema to API responses
- **Shared Types**: Common schema definitions between client and server

## Database Schema Design
The system uses a comprehensive relational schema including:
- **Users/Staff**: Role-based access control (admin, accountant, staff)
- **Company Settings**: Configurable business details and tax settings
- **Inventory Management**: Products, categories, suppliers with stock tracking
- **Customer Management**: Customer details, credit limits, payment terms
- **Transaction Management**: Sales, purchases with line items and VAT calculations
- **Financial Tracking**: Expenses with categorization and reporting

## Authentication and Authorization
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions
- **Role-Based Access**: Three-tier system (admin, accountant, staff) with different permission levels
- **User Management**: Full CRUD operations for staff management with active/inactive status

## API Architecture
- **RESTful Design**: Standard HTTP methods with consistent JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Request Validation**: Zod schemas for runtime validation of API inputs
- **Logging**: Request/response logging with performance metrics
- **CORS**: Configured for cross-origin requests in development

## Development Environment
- **Hot Reloading**: Vite HMR for instant frontend updates
- **Development Server**: Express middleware integration with Vite
- **Error Overlay**: Runtime error display for better debugging
- **TypeScript Checking**: Incremental compilation with strict type checking

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Modern TypeScript ORM with excellent type inference

## UI and Styling
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent icon system throughout the application
- **Google Fonts**: Inter font family for professional typography

## Development and Build Tools
- **Vite**: Fast build tool with plugin ecosystem
- **esbuild**: JavaScript bundler for production server builds
- **TanStack Query**: Powerful data fetching and caching library
- **React Hook Form**: Performant forms with minimal re-renders

## Validation and Type Safety
- **Zod**: Runtime type validation and schema parsing
- **TypeScript**: Static type checking across the entire application
- **Drizzle Zod**: Integration between database schema and validation

## Development Platform Integration
- **Replit**: Specialized plugins for development environment integration
- **Runtime Error Modal**: Enhanced error reporting in development
- **Cartographer**: Development tooling for Replit environment