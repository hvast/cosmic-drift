import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { User, CreateUserDTO, UserResponse } from '../models/User';

export class UserService {
  private userRepository: UserRepository;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserDTO): Promise<UserResponse> {
    // Validate email format
    if (!this.isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (!this.isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Validate username
    if (!this.isValidUsername(userData.username)) {
      throw new Error('Username must be 3-50 characters long and contain only letters, numbers, and underscores');
    }

    // Check email uniqueness
    const emailExists = await this.userRepository.emailExists(userData.email);
    if (emailExists) {
      throw new Error('Email already exists');
    }

    // Check username uniqueness
    const usernameExists = await this.userRepository.usernameExists(userData.username);
    if (usernameExists) {
      throw new Error('Username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      passwordHash
    });

    return this.toUserResponse(user);
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    return this.toUserResponse(user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }

  async updateLastActive(userId: string): Promise<void> {
    await this.userRepository.updateLastActive(userId);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  private isValidUsername(username: string): boolean {
    // 3-50 characters, letters, numbers, and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
      stats: user.stats
    };
  }
}
