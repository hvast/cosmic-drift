# Cosmic Drift Backend

Backend API server for the Cosmic Drift platform.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with database and Redis credentials.

4. Set up the database:
```bash
# Make sure PostgreSQL is running
# Then run migrations
npm run migrate
```

### Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

### Database Migrations

Run migrations:
```bash
npm run migrate
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run migrate` - Run database migrations

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── models/         # Data models
│   └── index.ts        # Entry point
├── migrations/         # Database migrations
└── scripts/           # Utility scripts
```

## API Documentation

API documentation will be available at `/api/docs` once implemented.
