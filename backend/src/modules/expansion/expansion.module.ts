import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReplayProtectionService } from '../../common/services/replay-protection.service';
import { jwtConfig } from '../../config';
import { ExpansionController } from './expansion.controller';
import { ExpansionService } from './expansion.service';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn as any },
    }),
  ],
  controllers: [ExpansionController],
  providers: [
    ExpansionService,
    PrismaService,
    JwtGuard,
    RolesGuard,
    ReplayProtectionService,
  ],
  exports: [ExpansionService],
})
export class ExpansionModule {}
