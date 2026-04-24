import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtGuard, RolesGuard, JwtService, ReplayProtectionService],
  exports: [UsersService],
})
export class UsersModule {}
