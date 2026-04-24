import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../common/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, PrismaService, JwtGuard, JwtService, ReplayProtectionService],
})
export class AccountsModule {}
