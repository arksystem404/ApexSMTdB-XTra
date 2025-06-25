# APEX SMT - AI-Powered Stock Trading Platform

## Overview

APEX SMT is a comprehensive stock trading and investment platform that combines real-time market data, AI-powered analysis, and portfolio management tools. The application provides users with watchlist management, portfolio optimization, stock screening, and market insights powered by OpenAI's GPT-4.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

- **Frontend**: React/TypeScript with Vite for fast development and modern UI components
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Firebase Authentication with custom user management
- **AI Integration**: OpenAI GPT-4 for stock analysis and portfolio optimization
- **Market Data**: SMT API integration for real-time stock market data

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI components with Tailwind CSS for styling
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theming**: Custom theme system with multiple color schemes (Light, Dark, Wall Street, Tech Investor, Hedge Fund)

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL
- **External APIs**: 
  - SMT API for market data
  - OpenAI API for AI-powered analysis
  - Firebase for authentication
- **Storage**: In-memory storage interface with extensibility for database implementation

### Database Schema
Key entities include:
- **Users**: Authentication and profile management
- **Watchlist Items**: User's tracked stocks
- **Portfolio Holdings**: Investment positions with quantity and average price
- **AI Analysis**: Generated insights and recommendations
- **Market Signals**: AI-generated buy/hold/sell signals
- **Trading Journal**: Transaction history and notes
- **User Settings**: Preferences and configuration

## Data Flow

1. **Market Data**: Real-time data flows from SMT API to backend services
2. **User Actions**: Frontend sends requests to Express API endpoints
3. **AI Processing**: OpenAI API processes market data and user portfolios for insights
4. **Database Operations**: Drizzle ORM handles all database interactions
5. **Real-time Updates**: TanStack Query manages caching and background refetching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **axios**: HTTP client for API requests
- **firebase**: Authentication and cloud services

### UI Dependencies
- **@radix-ui/***: Headless UI component library
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Modern icon library
- **class-variance-authority**: Utility for managing component variants

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development Environment
- **Runtime**: Node.js 20 with PostgreSQL 16
- **Development Server**: Runs on port 5000 with Vite dev server
- **Hot Reloading**: Full stack hot reloading for rapid development

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code with external dependencies
- **Database**: Drizzle migrations handle schema updates
- **Deployment**: Autoscale deployment target with build/run scripts

### Environment Configuration
Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access key
- `FIREBASE_*`: Firebase project configuration
- `SMT_ACCOUNT_ID` and `SMT_SESSION_ID`: SMT API credentials

## Recent Changes

- **June 25, 2025** - Enhanced UI/UX with improved theme system
  - Upgraded to Gemini AI for all AI-powered features
  - Enhanced theme palettes for Wall Street, Tech Investor, and Hedge Fund themes
  - Focused on Watchlist as primary feature with enhanced real-time tracking
  - Integrated Portfolio Optimization into AI Investment Fund section
  - Removed unwanted features: historical data viewer, news sentiment analysis, economic calendar
  - Trading Journal remains disabled by default
  - Improved glassmorphism effects and animations for professional appearance
  - **Database Integration**: Migrated from in-memory storage to PostgreSQL database
    - Implemented DatabaseStorage class with full CRUD operations
    - Applied database schema with all tables (users, watchlist, portfolio, etc.)
    - Maintained complete data persistence and real-time functionality
  - **Comprehensive SMT API Integration**: Added original advanced features
    - Stock Detail Modal with price charts, buy/sell signals, and technical indicators
    - Enhanced Stock Screener with dividend yields, P/E, P/B ratio filtering
    - AI Deep Dive Analysis with Ray Dalio-style systematic evaluation
    - Order depth visualization and comprehensive financial metrics
    - Real-time price history with trading signals and volume analysis

## Changelog

```
Changelog:
- June 25, 2025. Initial setup and enhanced implementation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```