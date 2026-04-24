import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import { LoginDTO, SignupDTO, AuthResponse } from './auth.dto';
import { PrismaService } from '../../common/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * Auth Service
 * Handles authentication logic: login, signup, token refresh
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Sign up a new user
   */
  async signup(dto: SignupDTO): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: passwordHash,
        role: UserRole.USER,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: this.refreshExpiryDate(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGNUP',
        resource: 'USER',
        resourceId: user.id,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Login user with email and password
   */
  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await this.comparePassword(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: this.refreshExpiryDate(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'USER',
        resourceId: user.id,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 24 * 60 * 60,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const stored = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!stored || stored.expiresAt.getTime() < Date.now()) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }

      const decoded = this.jwtService.verify(refreshToken) as {
        sub: string;
        email: string;
        role: string;
      };

      const newAccessToken = this.jwtService.sign(
        {
          sub: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        },
        { expiresIn: '24h' },
      );

      return {
        accessToken: newAccessToken,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Hash password with bcryptjs
   */
  async hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  /**
   * Compare plaintext password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(userId: string, email: string, role: UserRole) {
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
      },
      { expiresIn: '24h' },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
        type: 'refresh',
      },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private refreshExpiryDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }
}
