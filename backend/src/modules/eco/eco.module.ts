import { Module } from '@nestjs/common';
import { EcoController } from './eco.controller';
import { EcoService } from './eco.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [EcoController],
  providers: [EcoService, PrismaService],
})
export class EcoModule {}
