import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User as UserDecorator } from '../../common/decorators/user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { CreateUserDTOSchema } from './users.dto';

/**
 * Users Controller
 * Endpoints: get profile, list users (admin)
 */
@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@UserDecorator() user: any) {
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'List all users (admin/manager only)' })
  async listUsers(@Query('page') page = '1', @Query('limit') limit = '10') {
    const result = await this.usersService.findAll(Number(page), Number(limit));

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create user (admin only)' })
  async createUser(@Body() dto: unknown) {
    try {
      const validated = CreateUserDTOSchema.parse(dto);
      const result = await this.usersService.create(validated);

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid payload');
    }
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user (admin only)' })
  async updateUser(@Param('id') id: string, @Body() dto: Partial<{ email: string; name: string; role: 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER' }>) {
    const result = await this.usersService.update(id, dto);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft delete user (admin only)' })
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.delete(id);

    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
