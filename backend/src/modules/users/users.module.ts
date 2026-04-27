import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';
import { jwtConfig } from '../../config';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn as any },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtGuard, RolesGuard, ReplayProtectionService],
  exports: [UsersService],
})
export class UsersModule {}
