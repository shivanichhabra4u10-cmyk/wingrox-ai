import { Controller, Post, Body, BadRequestException, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as ApiSwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDTOSchema, SignupDTOSchema, RefreshTokenDTOSchema, AuthResponse } from './auth.dto';

/**
 * Auth Controller
 * Endpoints: login, signup, refresh token
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiSwaggerResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGc...',
          refreshToken: 'eyJhbGc...',
          expiresIn: 86400,
          user: { id: '...', email: '...', name: '...', role: 'USER' },
        },
      },
    },
  })
  @ApiSwaggerResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: any) {
    try {
      const validated = LoginDTOSchema.parse(dto);
      const result = await this.authService.login(validated);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiSwaggerResponse({
    status: 201,
    description: 'Account created successfully',
  })
  @ApiSwaggerResponse({
    status: 400,
    description: 'Invalid input or email already exists',
  })
  async signup(@Body() dto: any) {
    try {
      const validated = SignupDTOSchema.parse(dto);
      const result = await this.authService.signup(validated);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiSwaggerResponse({
    status: 200,
    description: 'Token refreshed',
  })
  @ApiSwaggerResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body() dto: any) {
    try {
      const validated = RefreshTokenDTOSchema.parse(dto);
      const result = await this.authService.refreshToken(validated.refreshToken);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
