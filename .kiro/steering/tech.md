# Technology Stack

## Architecture

Full-stack TypeScript monorepo with separate frontend and backend applications.

## Frontend

**Core Stack**
- React 18 + TypeScript
- React Router v6 (routing)
- TailwindCSS (styling with custom cosmic theme)
- Framer Motion (animations)

**Key Libraries**
- Three.js (3D visualization)
- Fabric.js (canvas drawing)
- Socket.io-client (real-time communication)
- Axios (HTTP client)

**Build System**
- Create React App (CRA)
- PostCSS + Autoprefixer
- ESLint + Prettier

## Backend

**Core Stack**
- Node.js + Express + TypeScript
- MySQL 8.0 (relational database)
- Socket.io (WebSocket, planned)

**Key Libraries**
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- Joi (validation)
- mysql2 (database driver)
- canvas (server-side image processing)
- axios (HTTP client for OpenAI)

**Build System**
- TypeScript compiler
- ts-node-dev (development)
- ESLint + Prettier

## AI Services

- OpenAI GPT-4 (conversation, profile generation)
- OpenAI Vision (image analysis)

## Development Tools

- Concurrently (run multiple processes)
- TypeScript 5.3+
- Node.js 18+

## Common Commands

### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run install:all      # Install all dependencies
npm run build            # Build both apps
npm run lint             # Lint both apps
npm run format           # Format both apps
npm run migrate          # Run database migrations
npm run kill:ports       # Kill processes on ports 3000/3001
```

### Backend (cd backend)
```bash
npm run dev              # Start dev server (port 3001)
npm run build            # Compile TypeScript
npm start                # Run production build
npm run migrate          # Run database migrations
npm run lint             # Run ESLint
npm run format           # Run Prettier
```

### Frontend (cd frontend)
```bash
npm start                # Start dev server (port 3000)
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Run ESLint
npm run format           # Run Prettier
```

## Configuration Files

**TypeScript**
- Strict mode enabled
- ES2020 target
- CommonJS (backend) / ESNext (frontend) modules
- Source maps enabled

**ESLint**
- TypeScript ESLint parser
- Recommended rules
- Unused vars as warnings (with `_` prefix ignore)

**Prettier**
- Single quotes
- Semicolons
- 2 space indentation
- 100 character line width
- ES5 trailing commas

## Environment Variables

**Backend (.env)**
- `PORT` - Server port (default: 3001)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL config
- `JWT_SECRET` - JWT signing key
- `OPENAI_API_KEY` - OpenAI API key
- `CORS_ORIGIN` - CORS allowed origin

**Frontend (.env)**
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001)

## Database

**MySQL 8.0+**
- Migrations in `backend/migrations/`
- Run with `npm run migrate` from backend directory
- Database name: `cosmicDrift`

## Ports

- Frontend: 3000
- Backend: 3001
