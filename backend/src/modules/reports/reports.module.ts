import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { PrismaService } from '../../common/prisma.service';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';
import { jwtConfig } from '../../config';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn as any },
    }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PrismaService, JwtGuard, ReplayProtectionService],
})
export class ReportsModule {}
