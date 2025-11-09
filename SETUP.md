# Periscope Setup Guide

This guide will help you set up and run the Periscope application locally.

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE periscope;

# Exit psql
\q
```

#### Run Migrations

```bash
# Set up environment variables (copy .env.example to .env and update)
cp .env.example .env

# Run migrations
npm run db:migrate
```

### 3. Redis Setup

Make sure Redis is running:

```bash
# On macOS with Homebrew
brew services start redis

# On Linux
sudo systemctl start redis

# On Windows
# Start Redis service from Services panel
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/periscope
DB_HOST=localhost
DB_PORT=5432
DB_NAME=periscope
DB_USER=postgres
DB_PASSWORD=postgres

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 5. Run the Application

#### Development Mode (Both Server and Client)

```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend Next.js app on `http://localhost:3000`

#### Run Separately

```bash
# Terminal 1: Backend server
npm run dev:server

# Terminal 2: Frontend client
npm run dev:client
```

### 6. Verify Installation

1. Check backend health: `http://localhost:3001/health`
2. Open frontend: `http://localhost:3000`
3. Create a test claim through the UI

## API Endpoints

- `GET /health` - Health check
- `POST /v1/claims` - Create a new claim
- `GET /v1/claims` - List claims (with filters)
- `GET /v1/claims/:id` - Get a specific claim
- `POST /v1/claims/:id/resolve` - Resolve a claim with outcome
- `GET /v1/leaderboard` - Get leaderboard

## Database Schema

The database includes the following tables:
- `forecaster` - People or entities making predictions
- `source` - Original sources (tweets, articles, videos)
- `claim` - Predictions and their metadata
- `outcome` - Actual results linked to claims
- `claim_tag` - Keywords, topics, or regions

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check Redis configuration in `.env`

### Port Already in Use

- Change `PORT` in `.env` for backend
- Change port in `frontend/package.json` scripts for frontend

## Production Build

```bash
# Build both server and client
npm run build

# Start production server
npm start
```

## License

MIT

