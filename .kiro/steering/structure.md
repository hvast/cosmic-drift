# Project Structure

## Repository Layout

```
cosmicDrift/
├── backend/              # Node.js backend application
├── frontend/             # React frontend application
├── scripts/              # Build and utility scripts
├── docs/                 # Project documentation
├── .kiro/                # Kiro specs and steering
├── package.json          # Root workspace config
└── README.md             # Project overview
```

## Backend Architecture (`backend/src/`)

**Layered Architecture Pattern**: Request → Route → Controller → Service → Repository → Database

```
backend/src/
├── config/               # Configuration (database, redis)
├── controllers/          # HTTP request handlers
├── middleware/           # Express middleware (auth, error handling)
├── models/               # TypeScript type definitions
├── repositories/         # Data access layer (SQL queries)
├── routes/               # API route definitions
├── services/             # Business logic layer
├── types/                # Shared TypeScript types
├── utils/                # Utility functions (JWT, etc.)
├── validators/           # Joi validation schemas
└── index.ts              # Application entry point
```

**Layer Responsibilities**:
- **Routes**: Define endpoints, apply middleware, bind controllers
- **Controllers**: Handle HTTP request/response, call services
- **Services**: Core business logic, orchestrate repositories, transactions
- **Repositories**: Database operations, SQL queries, data mapping
- **Models**: TypeScript interfaces and types
- **Validators**: Input validation with Joi schemas
- **Middleware**: Authentication, error handling, logging

**Naming Conventions**:
- Controllers: `*Controller.ts` (e.g., `CreatureController.ts`)
- Services: `*Service.ts` (e.g., `CreatureService.ts`)
- Repositories: `*Repository.ts` (e.g., `CreatureRepository.ts`)
- Routes: lowercase with hyphens (e.g., `creatures.ts`)

## Frontend Architecture (`frontend/src/`)

**Component-Based Architecture**

```
frontend/src/
├── components/           # Reusable React components
├── contexts/             # React Context providers (AuthContext)
├── pages/                # Page-level components (routes)
├── services/             # API client services
├── types/                # TypeScript type definitions
├── App.tsx               # Root component with routing
├── index.tsx             # Application entry point
└── index.css             # Global styles (Tailwind)
```

**Component Organization**:
- **components/**: Reusable UI components (CreatureCard, Canvas, etc.)
- **pages/**: Top-level route components (HomePage, CreatePage, etc.)
- **contexts/**: Global state management (AuthContext for user state)
- **services/**: API communication layer (axios wrappers)
- **types/**: Shared TypeScript interfaces

**Naming Conventions**:
- Components: PascalCase (e.g., `CreatureCanvas.tsx`)
- Services: camelCase (e.g., `creatureService.ts`)
- Types: camelCase (e.g., `creature.ts`)
- Pages: PascalCase with "Page" suffix (e.g., `HomePage.tsx`)

## Key Directories

**`backend/migrations/`**: Database migration SQL files
- Numbered sequentially (001, 002, etc.)
- Run with `npm run migrate`

**`backend/uploads/`**: User-uploaded files (images)
- Served statically at `/uploads`
- Gitignored

**`backend/tests/`**: Test scripts and utilities
- API testing scripts
- Development tools

**`backend/tools/`**: Development utilities
- Debugging tools
- Helper scripts

**`docs/`**: Project documentation
- Chinese language docs
- API guides, development guides
- `docs/archive/`: Historical/temporary docs

**`.kiro/specs/`**: Kiro specification documents
- Requirements, design, tasks
- Feature specifications

**`scripts/`**: Build and startup scripts
- `clean-start.js`: Interactive startup menu
- `kill-ports.js`: Kill processes on ports
- `install-all.bat`: Install all dependencies

## File Naming Conventions

**Backend**:
- Classes/Controllers/Services: PascalCase (e.g., `CreatureService.ts`)
- Routes: lowercase (e.g., `creatures.ts`)
- Utilities: camelCase (e.g., `jwt.ts`)
- Database tables: snake_case (e.g., `creatures`, `user_creatures`)

**Frontend**:
- Components: PascalCase (e.g., `CreatureCard.tsx`)
- Services: camelCase (e.g., `authService.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Styles: kebab-case (e.g., `creature-card.css`)

## Import Conventions

**Backend**: Relative imports
```typescript
import { CreatureService } from '../services/CreatureService';
import { authenticate } from '../middleware/auth';
```

**Frontend**: Absolute imports from `src/`
```typescript
import { CreatureCard } from 'components/CreatureCard';
import { authService } from 'services/authService';
```

## Code Organization Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Direction**: Controllers → Services → Repositories (never reverse)
3. **Type Safety**: Explicit TypeScript types for all public APIs
4. **Validation**: Input validation at route level with Joi
5. **Error Handling**: Centralized error middleware
6. **Authentication**: JWT-based, applied via middleware
7. **API Design**: RESTful conventions with plural nouns
