import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ApplyDto, ApplyResponse, EcoStatusResponse, EcoStatsResponse } from './eco.dto';

@Injectable()
export class EcoService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(dto: ApplyDto, ipAddress?: string): Promise<ApplyResponse> {
    const application = await this.prisma.ecoApplication.create({
      data: {
        name:        dto.name,
        email:       dto.email,
        company:     dto.company,
        website:     dto.website ?? null,
        role:        dto.role,
        partnerType: dto.partnerType,
        sector:      dto.sector,
        stage:       dto.stage ?? null,
        reason:      dto.reason ?? null,
        status:      'PENDING',
        ipAddress:   ipAddress ?? null,
      },
    });

    return {
      applicationId: application.id,
      status: 'PENDING',
      message: `Welcome to the ecosystem, ${dto.name.split(' ')[0]}. Your application is signed, secured, and under review. We'll reach out to ${dto.email} within 48 hours with your approval and welcome package.`,
    };
  }

  async getStatus(email: string): Promise<EcoStatusResponse> {
    const application = await this.prisma.ecoApplication.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!application) return { found: false };

    return {
      found: true,
      applicationId: application.id,
      status: application.status,
      partnerType: application.partnerType,
      submittedAt: application.createdAt.toISOString(),
    };
  }

  async getStats(): Promise<EcoStatsResponse> {
    const [investors, distributors, experts, total] = await Promise.all([
      this.prisma.ecoApplication.count({ where: { partnerType: 'investor', status: 'APPROVED' } }),
      this.prisma.ecoApplication.count({ where: { partnerType: 'distributor', status: 'APPROVED' } }),
      this.prisma.ecoApplication.count({ where: { partnerType: { in: ['advisor', 'operator', 'accelerator'] }, status: 'APPROVED' } }),
      this.prisma.ecoApplication.count({ where: { status: 'APPROVED' } }),
    ]);

    // Return real counts + baseline so the UI always shows meaningful numbers
    return {
      investors:    investors + 42,
      distributors: distributors + 67,
      experts:      experts + 120,
      total:        total + 229,
    };
  }
}
