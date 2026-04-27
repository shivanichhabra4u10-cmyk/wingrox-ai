import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';
import { jwtConfig } from '../../config';
import { TwinAssessmentController } from './twin-assessment.controller';
import { TwinAssessmentService } from './twin-assessment.service';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn as any },
    }),
  ],
  controllers: [TwinAssessmentController],
  providers: [
    TwinAssessmentService,
    PrismaService,
    JwtGuard,
    RolesGuard,
    ReplayProtectionService,
  ],
  exports: [TwinAssessmentService],
})
export class TwinAssessmentModule {}
