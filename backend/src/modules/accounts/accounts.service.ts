import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateAccountDTO, UpdateAccountDTO } from './accounts.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async listByOwner(ownerId: string) {
    return this.prisma.account.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(ownerId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, ownerId, deletedAt: null },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async create(ownerId: string, dto: CreateAccountDTO) {
    return this.prisma.account.create({
      data: {
        ...dto,
        annualRevenueUsd: dto.annualRevenueUsd,
        ownerId,
      },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateAccountDTO) {
    await this.getById(ownerId, id);

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  async remove(ownerId: string, id: string) {
    await this.getById(ownerId, id);

    await this.prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { deleted: true };
  }
}
