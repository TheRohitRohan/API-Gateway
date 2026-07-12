import { PrismaClient, User } from '../generated/client/index.js';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(data: { email: string; passwordHash: string; name: string; role?: string }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
        name: data.name,
        role: data.role ?? 'customer',
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
