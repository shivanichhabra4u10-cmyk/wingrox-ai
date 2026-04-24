import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDTO } from './users.dto';
import { PrismaService } from '../../common/prisma.service';
import { UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * Users Service
 * Handles user-related business logic
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user by ID
   */
  async findById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get all users (admin only)
   */
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      hasMore: skip + items.length < total,
    };
  }

  /**
   * Create a new user
   */
  async create(dto: CreateUserDTO) {
    const passwordHash = await hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        role: dto.role as UserRole,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async update(userId: string, data: Partial<CreateUserDTO>) {
    await this.findById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.email ? { email: data.email } : {}),
        ...(data.name ? { name: data.name } : {}),
        ...(data.role ? { role: data.role as UserRole } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user (soft delete)
   */
  async delete(userId: string) {
    await this.findById(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return { deleted: true };
  }
}
