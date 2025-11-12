# Authentication System Implementation

## Overview
Complete user authentication system with JWT tokens, password encryption, and role-based access control.

## Backend Components

### Models
- `User.ts` - User data model with stats tracking

### Repositories
- `UserRepository.ts` - Database operations for users
  - Create, read, update operations
  - Email and username uniqueness checks
  - User statistics aggregation

### Services
- `UserService.ts` - Business logic layer
  - User registration with validation
  - Password hashing with bcrypt
  - Email format validation
  - Password strength validation (8+ chars, uppercase, lowercase, number)
  - Username validation (3-50 chars, alphanumeric + underscore)

### Controllers
- `AuthController.ts` - HTTP request handlers
  - POST /api/auth/register - User registration
  - POST /api/auth/login - User login
  - POST /api/auth/refresh - Token refresh
  - GET /api/auth/me - Get current user

### Middleware
- `auth.ts` - JWT authentication middleware
  - `authenticate` - Require valid token
  - `optionalAuth` - Optional authentication

### Validators
- `authValidator.ts` - Input validation with Joi
  - Register data validation
  - Login credentials validation
  - Refresh token validation

### Utilities
- `jwt.ts` - JWT token management
  - Generate access and refresh tokens
  - Verify tokens
  - Decode tokens

## Frontend Components

### Services
- `api.ts` - HTTP client with auth header injection
- `authService.ts` - Authentication API calls and token storage

### Context
- `AuthContext.tsx` - Global authentication state
  - User state management
  - Login/register/logout functions
  - Auto-initialization on app load

### Components
- `ProtectedRoute.tsx` - Route guard for authenticated pages

### Pages
- `LoginPage.tsx` - User login form
- `RegisterPage.tsx` - User registration form with role selection

## API Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "username": "cosmic_wanderer",
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "explorer"
}
```

### POST /api/auth/login
Login existing user
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### POST /api/auth/refresh
Refresh access token
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/me
Get current user (requires authentication)
Headers: `Authorization: Bearer <accessToken>`

## Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Password strength validation
   - Never expose password hashes in responses

2. **JWT Tokens**
   - Access token: 7 days expiry
   - Refresh token: 30 days expiry
   - Secure token verification

3. **Input Validation**
   - Joi schema validation
   - Email format validation
   - Username uniqueness check
   - Password complexity requirements

4. **Error Handling**
   - Consistent error response format
   - Appropriate HTTP status codes
   - No sensitive information in error messages

## Environment Variables

Backend (.env):
```
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:3001
```

## Usage

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Testing the API

Using curl:
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","email":"test@example.com","password":"Test1234","role":"explorer"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Get current user
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
