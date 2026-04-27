import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import {
  CompleteAssessmentDTO,
  ListAssessmentsDTO,
  SaveProgressDTO,
  SendOtpDTO,
  VerifyOtpDTO,
} from './twin-assessment.dto';

type TwinAssessmentRow = {
  id: string;
  email: string;
  packageKey: string;
  status: string;
  otpCodeHash: string | null;
  otpExpiresAt: Date | null;
  otpAttempts: number;
  verifiedAt: Date | null;
  completedAt: Date | null;
  sessionJti: string | null;
};

@Injectable()
export class TwinAssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private hashOtp(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private async writeAudit(action: string, resourceId: string | null, changes: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: {
        action,
        resource: 'TWIN_ASSESSMENT',
        resourceId: resourceId ?? undefined,
        changes: changes as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private async findById(id: string): Promise<TwinAssessmentRow | null> {
    const rows = await this.prisma.$queryRaw<TwinAssessmentRow[]>`
      SELECT "id", "email", "packageKey", "status", "otpCodeHash", "otpExpiresAt", "otpAttempts", "verifiedAt", "completedAt", "sessionJti"
      FROM "twin_assessments"
      WHERE "id" = ${id}
      LIMIT 1
    `;

    return rows[0] ?? null;
  }

  private async verifySessionToken(sessionToken: string) {
    let payload: { sub: string; email: string; jti: string; kind: string };

    try {
      payload = this.jwtService.verify(sessionToken, {
        secret: process.env.TWIN_SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired session token');
    }

    if (payload.kind !== 'twin-assessment-session') {
      throw new UnauthorizedException('Invalid session scope');
    }

    const existing = await this.findById(payload.sub);
    if (!existing) {
      throw new UnauthorizedException('Assessment session not found');
    }

    if (existing.sessionJti && existing.sessionJti !== payload.jti) {
      throw new UnauthorizedException('Session token mismatch');
    }

    return existing;
  }

  private async saveData(input: SaveProgressDTO, status: 'IN_PROGRESS' | 'COMPLETED') {
    const existing = await this.verifySessionToken(input.sessionToken);
    const now = new Date();

    const updatedRows = await this.prisma.$queryRaw<
      Array<{ id: string; email: string; packageKey: string; status: string; completedAt: Date | null }>
    >`
      UPDATE "twin_assessments"
      SET "packageKey" = ${input.packageKey},
          "company" = ${JSON.stringify(input.company ?? {})}::jsonb,
          "canvas" = ${JSON.stringify(input.canvas ?? {})}::jsonb,
          "answers" = ${JSON.stringify(input.answers ?? {})}::jsonb,
          "aiAnswers" = ${JSON.stringify(input.aiAnswers ?? {})}::jsonb,
          "metadata" = ${JSON.stringify(input.metadata ?? {})}::jsonb,
          "status" = ${status},
          "completedAt" = ${status === 'COMPLETED' ? now : null},
          "updatedAt" = ${now}
      WHERE "id" = ${existing.id}
      RETURNING "id", "email", "packageKey", "status", "completedAt"
    `;

    return updatedRows[0] ?? null;
  }

  async sendOtp(input: SendOtpDTO) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO "twin_assessments" (
        "id", "email", "packageKey", "status", "otpCodeHash", "otpExpiresAt", "metadata", "createdAt", "updatedAt"
      ) VALUES (
        ${randomUUID()},
        ${input.email.toLowerCase()},
        ${input.packageKey},
        'OTP_SENT',
        ${this.hashOtp(code)},
        ${expiresAt},
        ${JSON.stringify({ source: 'native-twin-phase2' })}::jsonb,
        ${now},
        ${now}
      )
      RETURNING "id"
    `;

    const assessmentId = rows[0]?.id ?? null;

    await this.writeAudit('TWIN_OTP_SEND', assessmentId, {
      email: input.email.toLowerCase(),
      packageKey: input.packageKey,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      assessmentId,
      expiresAt: expiresAt.toISOString(),
      demoOtp: process.env.NODE_ENV === 'production' ? null : code,
    };
  }

  async verifyOtp(input: VerifyOtpDTO) {
    const rows = await this.prisma.$queryRaw<TwinAssessmentRow[]>`
      SELECT "id", "email", "packageKey", "status", "otpCodeHash", "otpExpiresAt", "otpAttempts", "verifiedAt", "completedAt", "sessionJti"
      FROM "twin_assessments"
      WHERE "email" = ${input.email.toLowerCase()}
        AND "status" IN ('OTP_SENT', 'OTP_PENDING', 'IN_PROGRESS')
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    const latest = rows[0];
    if (!latest) {
      throw new UnauthorizedException('No pending OTP session found');
    }

    const now = new Date();
    if (!latest.otpExpiresAt || latest.otpExpiresAt < now) {
      await this.prisma.$executeRaw`
        UPDATE "twin_assessments"
        SET "status" = 'OTP_EXPIRED', "updatedAt" = ${now}
        WHERE "id" = ${latest.id}
      `;
      throw new UnauthorizedException('OTP expired, request a new code');
    }

    if (latest.otpCodeHash !== this.hashOtp(input.code)) {
      await this.prisma.$executeRaw`
        UPDATE "twin_assessments"
        SET "otpAttempts" = ${latest.otpAttempts + 1}, "updatedAt" = ${now}
        WHERE "id" = ${latest.id}
      `;
      throw new UnauthorizedException('Invalid OTP');
    }

    const jti = randomUUID();
    await this.prisma.$executeRaw`
      UPDATE "twin_assessments"
      SET "status" = 'VERIFIED',
          "verifiedAt" = ${now},
          "sessionJti" = ${jti},
          "updatedAt" = ${now}
      WHERE "id" = ${latest.id}
    `;

    await this.writeAudit('TWIN_OTP_VERIFY', latest.id, {
      email: latest.email,
      verifiedAt: now.toISOString(),
    });

    const sessionToken = this.jwtService.sign(
      {
        sub: latest.id,
        email: latest.email,
        kind: 'twin-assessment-session',
        jti,
      },
      {
        expiresIn: '8h',
        secret: process.env.TWIN_SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
      },
    );

    return {
      assessmentId: latest.id,
      packageKey: latest.packageKey,
      sessionToken,
    };
  }

  async saveProgress(input: SaveProgressDTO) {
    const updated = await this.saveData(input, 'IN_PROGRESS');
    if (!updated) {
      throw new UnauthorizedException('Unable to save progress');
    }

    await this.writeAudit('TWIN_ASSESSMENT_PROGRESS', updated.id, {
      packageKey: updated.packageKey,
      status: updated.status,
    });

    return updated;
  }

  async completeAssessment(input: CompleteAssessmentDTO) {
    const updated = await this.saveData(input, 'COMPLETED');
    if (!updated) {
      throw new UnauthorizedException('Unable to persist assessment');
    }

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE "twin_assessments"
      SET "report" = ${JSON.stringify(input.report ?? {})}::jsonb,
          "updatedAt" = ${now}
      WHERE "id" = ${updated.id}
    `;

    await this.writeAudit('TWIN_ASSESSMENT_COMPLETE', updated.id, {
      packageKey: updated.packageKey,
      completedAt: now.toISOString(),
    });

    return updated;
  }

  async listAssessments(input: ListAssessmentsDTO) {
    const filters: Prisma.Sql[] = [];

    if (input.email) {
      filters.push(Prisma.sql`"email" = ${input.email.toLowerCase()}`);
    }
    if (input.status) {
      filters.push(Prisma.sql`"status" = ${input.status}`);
    }

    const whereClause = filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}` : Prisma.sql``;

    const countRows = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*)::bigint AS "total"
      FROM "twin_assessments"
      ${whereClause}
    `;

    const items = await this.prisma.$queryRaw<
      Array<{
        id: string;
        email: string;
        packageKey: string;
        status: string;
        createdAt: Date;
        verifiedAt: Date | null;
        completedAt: Date | null;
      }>
    >`
      SELECT "id", "email", "packageKey", "status", "createdAt", "verifiedAt", "completedAt"
      FROM "twin_assessments"
      ${whereClause}
      ORDER BY "createdAt" DESC
      OFFSET ${(input.page - 1) * input.limit}
      LIMIT ${input.limit}
    `;

    const total = Number(countRows[0]?.total ?? 0n);

    return {
      page: input.page,
      limit: input.limit,
      total,
      hasMore: input.page * input.limit < total,
      items,
    };
  }
}
