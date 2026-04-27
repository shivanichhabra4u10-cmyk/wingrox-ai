import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../common/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';
import { jwtConfig } from '../../config';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn as any },
    }),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, PrismaService, JwtGuard, ReplayProtectionService],
})
export class AccountsModule {}
