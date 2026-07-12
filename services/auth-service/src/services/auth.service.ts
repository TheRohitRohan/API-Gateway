import { UserRepository } from '../repositories/user.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, UnauthorizedError, NotFoundError } from '@microservices-demo/shared-utils';
import { JwtPayload, UserRole } from '@microservices-demo/shared-types';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
  ) {}

  async register(data: { email: string; name: string; password: string; role?: string }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.createUser({
      email: data.email,
      name: data.name,
      passwordHash,
      role: data.role,
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const matches = await bcrypt.compare(data.password, user.password);
    if (!matches) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '24h',
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const { password: _, ...result } = user;
    return result;
  }
}
