import { Module } from '@nestjs/common';
import { HubController } from './hub.controller';
import { HubService } from './hub.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [HubController],
  providers: [HubService, PrismaService],
})
export class HubModule {}
