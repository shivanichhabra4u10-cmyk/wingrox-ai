import { Module } from '@nestjs/common';
import { SimController } from './sim.controller';
import { SimService } from './sim.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [SimController],
  providers: [SimService, PrismaService],
})
export class SimModule {}
