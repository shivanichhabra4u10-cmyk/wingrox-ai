import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { SaveRunDto, SaveRunResponse, LastRunResponse, UnlockDto, UnlockResponse } from './sim.dto';

@Injectable()
export class SimService {
  constructor(private readonly prisma: PrismaService) {}

  async saveRun(dto: SaveRunDto): Promise<SaveRunResponse> {
    const run = await this.prisma.simRun.create({
      data: {
        sessionId:     dto.sessionId,
        revenueK:      dto.inputs.revenueK,
        growthPct:     dto.inputs.growthPct,
        marginPct:     dto.inputs.marginPct,
        burnK:         dto.inputs.burnK,
        cashK:         dto.inputs.cashK,
        cac:           dto.inputs.cac,
        ltm:           dto.inputs.ltm,
        horizonMonths: dto.inputs.horizonMonths,
        outputs:       dto.outputs as any,
        label:         dto.label ?? null,
      },
    });

    return { runId: run.id, sessionId: run.sessionId };
  }

  async getLastRun(sessionId: string): Promise<LastRunResponse> {
    const run = await this.prisma.simRun.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    const unlock = await this.prisma.simUnlock.findUnique({ where: { sessionId } });

    if (!run) return { found: false, unlocked: !!unlock };

    return {
      found: true,
      runId: run.id,
      unlocked: !!unlock,
      inputs: {
        revenueK:     Number(run.revenueK),
        growthPct:    Number(run.growthPct),
        marginPct:    Number(run.marginPct),
        burnK:        Number(run.burnK),
        cashK:        Number(run.cashK),
        cac:          Number(run.cac),
        ltm:          run.ltm,
        horizonMonths: run.horizonMonths,
      },
      outputs: run.outputs as any,
      label:   run.label ?? undefined,
    };
  }

  async unlock(dto: UnlockDto): Promise<UnlockResponse> {
    await this.prisma.simUnlock.upsert({
      where:  { sessionId: dto.sessionId },
      update: { email: dto.email ?? null, paymentRef: dto.paymentRef ?? null },
      create: { sessionId: dto.sessionId, email: dto.email ?? null, paymentRef: dto.paymentRef ?? null },
    });

    return { unlocked: true, sessionId: dto.sessionId };
  }
}
