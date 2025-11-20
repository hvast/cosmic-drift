# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cosmic Drift (星际漂流计划)** is a digital life co-creation platform where users draw or upload creature images, AI generates personalities and backstories, and these creatures exist in a 3D galaxy visualization where users can interact with them through AI-powered conversations.

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Three.js + Fabric.js + TailwindCSS
- **Backend**: Node.js + Express + TypeScript + MySQL 8.0
- **AI**: Alibaba Qwen (通义千问) for profile generation and conversations
- **Real-time**: Socket.io (planned)

## Development Commands

### Setup and Installation
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with database credentials and API keys

# Initialize database
cd backend && npm run migrate
```

### Development
```bash
# Start both services concurrently (recommended)
npm run dev

# Or start separately:
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000

# Start with clean port management
npm start            # Interactive clean start
npm run start:backend
npm run start:frontend
```

### Build and Production
```bash
npm run build              # Build both services
npm run build:backend      # TypeScript compilation
npm run build:frontend     # React production build
```

### Code Quality
```bash
npm run lint               # Lint both projects
npm run format             # Format code with Prettier
```

### Database Management
```bash
cd backend && npm run migrate  # Run all migrations
mysql -u root -p cosmicDrift   # Connect to database
```

### Port Management (Windows)
```bash
npm run kill:ports         # Kill processes on 3000 and 3001
```

### Utilities
```bash
# Check contour data in database
cd backend && node check-contour-data.js

# Clear contour data
cd backend && node clear-contour-data.js

# Visualize creature contour
cd backend && node visualize-contour.js <creatureId>

# Test contour extraction
cd backend && npx ts-node test-contour-extraction.ts
```

## Architecture and Key Patterns

### Backend Architecture

**Layered Pattern**: Controller → Service → Repository

```
routes/          # Express route definitions, middleware attachment
  ├── auth.ts
  ├── creatures.ts
  ├── contour.ts
  └── conversations.ts

controllers/     # Request/response handling, validation
  └── [Feature]Controller.ts

services/        # Business logic, AI integration
  ├── CreatureService.ts
  ├── ProfileGeneratorService.ts  # Qwen AI profile generation
  ├── ImageAnalysisService.ts     # Qwen Vision image analysis
  ├── ContourExtractionService.ts # Canvas-based contour extraction
  ├── ConversationAIService.ts    # AI conversation generation
  └── StorageService.ts           # File upload handling

repositories/    # Database access layer
  └── [Feature]Repository.ts

models/          # Data models and types
```

**Key Services:**
- `ProfileGeneratorService`: Calls Qwen API to generate creature profiles from visual features
- `ContourExtractionService`: Extracts particle contours from images using alpha channel, background removal, and edge detection with fallback strategies
- `ImageAnalysisService`: Analyzes uploaded images to extract visual features
- `ConversationAIService`: Generates AI responses based on creature personality

### Frontend Architecture

```
pages/           # Top-level page components (routing)
  ├── HomePage.tsx
  ├── GalaxyPage.tsx      # 3D galaxy visualization
  ├── CreatePage.tsx      # Creature creation flow
  └── ChatPage.tsx        # Conversation interface

components/      # Reusable components
  ├── GalaxyScene.tsx           # Three.js galaxy rendering
  ├── ParticleOutlineViewer.tsx # Particle animation system
  ├── CreatureCanvas.tsx        # Fabric.js drawing canvas
  ├── ProfileEditor.tsx         # Profile editing interface
  └── ChatInterface.tsx         # Chat UI

services/        # API client layer
  ├── api.ts            # Axios instance with auth interceptor
  └── [feature]Service.ts

contexts/        # React Context for global state
  └── AuthContext.tsx
```

### Database Schema

**Core Tables:**
- `users` - User authentication and profiles
- `creatures` - Creature data with JSON fields for personality, contour_data
- `conversations` - Conversation records between users and creatures
- `messages` - Individual chat messages

**Important JSON Columns:**
- `creatures.personality` - Array of personality traits
- `creatures.contour_data` - Extracted particle contour points (normalized to [-1, 1])

## AI Service Configuration

This project uses **Alibaba Qwen (通义千问)** instead of OpenAI.

**Environment Variable:**
```env
QWEN_API_KEY=your-qwen-api-key-here
```

**Get API Key:** https://dashscope.console.aliyun.com/apiKey

**Fallback Behavior:** If `QWEN_API_KEY` is not configured, services use fallback data (default profiles, simple responses) to allow development without AI dependencies.

## Particle Contour System

The **particle outline feature** converts creature images into animated particle contours:

### Extraction Algorithm (Backend)
1. **Alpha Channel Extraction**: Primary method for PNG with transparency
2. **Background Removal**: Fallback for opaque images (detects background color from corners)
3. **Edge Detection**: Final fallback using Sobel operator
4. **Processing Pipeline**: Boundary detection → Nearest neighbor connection → Gaussian smoothing → Uniform sampling (300 points) → Normalization to [-1, 1]

### Rendering (Frontend)
- **ParticleOutlineViewer.tsx**: Three.js-based particle system
- **Animation Layers**: Breathing, flowing, twinkling, swaying
- **Emotion-Driven**: Animation speed controlled by creature's `emotionValue`
- **Rainbow Gradient**: HSL-based rainbow color progression

**Data Flow:**
1. User uploads image → Backend extracts contour → Saves to `creatures.contour_data`
2. Frontend fetches creature → Renders particles from `contour_data.points`

## Important Development Notes

### Environment Setup
**Backend (.env):**
```env
PORT=3001
DB_HOST=localhost
DB_NAME=cosmicDrift
DB_USER=root
DB_PASSWORD=your_password
QWEN_API_KEY=sk-xxx  # Optional, uses fallback if missing
JWT_SECRET=your-secret-key
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001
```

### Authentication Flow
- JWT-based authentication with 7-day token expiration
- Auth middleware: `backend/src/middleware/auth.ts`
- Frontend interceptor: `frontend/src/services/api.ts`
- **Note**: Some routes temporarily have auth disabled for rapid testing - check route files

### File Upload Handling
- `StorageService` manages uploads to `backend/uploads/`
- Image types: creatures (drawings/photos), temp (processing)
- Served statically at `/uploads` endpoint

### Error Handling
- Centralized error handler: `backend/src/middleware/errorHandler.ts`
- Joi validation in validators: `backend/src/validators/`
- Frontend displays user-friendly messages via API service

### Database Migrations
- SQL migrations in `backend/migrations/`
- Naming: `001_initial_schema.sql`, `002_feature_name.sql`
- Run with: `cd backend && npm run migrate`

## Common Development Workflows

### Adding a New Feature
1. **Backend**: Create route → controller → service → repository
2. **Frontend**: Create service function → page/component
3. **Database**: Add migration if schema changes needed
4. **Types**: Update TypeScript types in both `backend/src/types/` and `frontend/src/types/`

### Testing AI Integration
- Set `QWEN_API_KEY` in backend/.env
- Test profile generation: Create creature with AI generation option
- Test conversations: Chat with a creature in ChatPage
- Monitor console logs for API call details

### Working with Three.js Components
- **GalaxyScene.tsx**: Main 3D scene with camera controls
- **ParticleOutlineViewer.tsx**: Particle system for creature contours
- Use `useEffect` cleanup to dispose Three.js objects and prevent memory leaks

### Debugging Contour Issues
```bash
# Check if creature has contour data
node backend/check-contour-data.js

# Visualize specific creature's contour
node backend/visualize-contour.js <creatureId>

# Clear all contour data (forces re-extraction)
node backend/clear-contour-data.js
```

## Visual Style and Design

**Design Language**: Cyberpunk sci-fi with soft, mystical aesthetics
- Dark backgrounds (#000000, #0a0a0a)
- Cyan/blue accents (#00ffff, #3b82f6)
- Grid textures and scan-line effects
- Gradient glows and particle animations
- Poetic, empathetic copywriting

**Color Palette:**
- Primary: Cyan (`#00ffff`)
- Secondary: Blue (`#3b82f6`)
- Background: Black (`#000000`)
- Text: White/Gray gradient

## Known Issues and Limitations

1. **Contour Extraction**: Works best with transparent PNG images; opaque images use background removal fallback which may be less accurate
2. **Performance**: Galaxy page may slow down with 500+ creatures (needs virtual scrolling or pagination)
3. **Mobile Support**: Primarily optimized for desktop; mobile experience needs improvement
4. **Auth Temporarily Disabled**: Some routes bypass authentication for rapid development - restore before production

## Related Documentation

- `README.md` - Project overview and quick start
- `docs/快速启动指南.md` - 5-minute setup guide
- `docs/archive/PROJECT-HANDOVER.md` - Detailed project documentation
- `.kiro/specs/cosmic-drift/requirements.md` - Full product requirements
- `backend/README.md` - Backend API documentation
- `backend/README_AUTH.md` - Authentication system details
