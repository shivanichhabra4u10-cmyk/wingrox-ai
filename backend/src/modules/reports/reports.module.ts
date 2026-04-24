import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, JwtGuard, JwtService, ReplayProtectionService],
})
export class ReportsModule {}
