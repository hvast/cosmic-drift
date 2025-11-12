import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { generateTokenPair, verifyToken } from '../utils/jwt';
import { CreateUserDTO } from '../models/User';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const userData: CreateUserDTO = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role || 'explorer'
      };

      const user = await this.userService.createUser(userData);

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        user,
        tokens
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return res.status(409).json({
            error: {
              code: 'CONFLICT',
              message: error.message,
              timestamp: new Date()
            }
          });
        }
        
        if (error.message.includes('Invalid') || error.message.includes('must be')) {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
              timestamp: new Date()
            }
          });
        }
      }

      console.error('Registration error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user',
          timestamp: new Date()
        }
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
            timestamp: new Date()
          }
        });
      }

      const isPasswordValid = await this.userService.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
            timestamp: new Date()
          }
        });
      }

      // Update last active timestamp
      await this.userService.updateLastActive(user.id);

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remove password hash from response
      const { passwordHash, ...userResponse } = user;

      res.json({
        user: userResponse,
        tokens
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to login',
          timestamp: new Date()
        }
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const payload = verifyToken(refreshToken);

      const user = await this.userService.getUserById(payload.userId);

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found',
            timestamp: new Date()
          }
        });
      }

      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      res.json({ tokens });
    } catch (error) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired refresh token',
          timestamp: new Date()
        }
      });
    }
  };

  me = async (req: any, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
            timestamp: new Date()
          }
        });
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
            timestamp: new Date()
          }
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get user information',
          timestamp: new Date()
        }
      });
    }
  };
}
