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

type TwinDimensionReport = {
  key: string;
  title: string;
  score: number;
};

type TwinConstraintReport = {
  question: string;
  value: number;
};

type TwinDynamicReport = {
  generatedAt: string;
  packageKey: string;
  company: {
    name: string;
    country: string;
    industry: string;
    stage: string;
  };
  overallScore: number;
  readinessBand: string;
  dimensions: TwinDimensionReport[];
  topConstraints: TwinConstraintReport[];
  recommendations: string[];
  strategicPriority: string;
  planningHorizon: string;
  notes: string;
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

  private extractAnswerMap(answers: Record<string, unknown> | undefined): Record<string, number> {
    if (!answers) {
      return {};
    }

    const result: Record<string, number> = {};

    for (const [key, raw] of Object.entries(answers)) {
      if (!/^D\d+$/.test(key)) {
        continue;
      }

      const numericValue = Number(raw);
      if (!Number.isFinite(numericValue)) {
        continue;
      }

      result[key] = Math.max(0, Math.min(5, numericValue));
    }

    return result;
  }

  private buildDimensionScore(answerMap: Record<string, number>, keys: string[]): number {
    const values = keys.map((key) => answerMap[key]).filter((value): value is number => typeof value === 'number');

    if (!values.length) {
      return 0;
    }

    const average = values.reduce((acc, value) => acc + value, 0) / values.length;
    return Math.round(average * 20);
  }

  private getQuestionLabel(questionKey: string): string {
    const map: Record<string, string> = {
      D1: 'Revenue predictability',
      D2: 'Growth consistency',
      D8: 'Lead to customer conversion',
      D12: 'Customer acquisition cost',
      D14: 'Retention quality',
      D18: 'Cost structure efficiency',
      D24: 'Leadership depth',
      D29: 'Positioning clarity',
      D33: 'Strategic focus',
    };

    return map[questionKey] ?? `Diagnostic ${questionKey}`;
  }

  private buildDynamicReport(input: {
    packageKey: string;
    company?: Record<string, unknown>;
    answers?: Record<string, unknown>;
    strategicPriority: string;
    planningHorizon: string;
    notes: string;
  }): TwinDynamicReport {
    const answerMap = this.extractAnswerMap(input.answers);
    const answerValues = Object.values(answerMap);

    const dimensions: TwinDimensionReport[] = [
      {
        key: 'revenue-engine',
        title: 'Revenue Engine',
        score: this.buildDimensionScore(
          answerMap,
          ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11'],
        ),
      },
      {
        key: 'unit-economics',
        title: 'Unit Economics',
        score: this.buildDimensionScore(
          answerMap,
          ['D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D18', 'D19', 'D20', 'D21', 'D22', 'D23'],
        ),
      },
      {
        key: 'execution-strategy',
        title: 'Execution & Strategy',
        score: this.buildDimensionScore(
          answerMap,
          ['D24', 'D25', 'D26', 'D27', 'D28', 'D29', 'D30', 'D31', 'D32', 'D33', 'D34', 'D35'],
        ),
      },
    ];

    const overallScore = answerValues.length
      ? Math.round((answerValues.reduce((acc, value) => acc + value, 0) / answerValues.length) * 20)
      : 0;

    const readinessBand = overallScore >= 80
      ? 'Scale Ready'
      : overallScore >= 65
        ? 'Growth Ready'
        : overallScore >= 50
          ? 'Foundation Building'
          : 'At Risk';

    const topConstraints = Object.entries(answerMap)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([question, value]) => ({
        question: this.getQuestionLabel(question),
        value,
      }));

    const recommendations: string[] = [];
    const revenueDimension = dimensions.find((item) => item.key === 'revenue-engine')?.score ?? 0;
    const economicsDimension = dimensions.find((item) => item.key === 'unit-economics')?.score ?? 0;
    const strategyDimension = dimensions.find((item) => item.key === 'execution-strategy')?.score ?? 0;

    if (revenueDimension < 65) {
      recommendations.push('Stabilize funnel quality first: tighten ICP, lead qualification, and conversion handoff.');
    }
    if (economicsDimension < 65) {
      recommendations.push('Improve unit economics by reducing CAC leakage and raising retention-driven LTV.');
    }
    if (strategyDimension < 65) {
      recommendations.push('Increase execution cadence with clear weekly operating priorities and ownership tracking.');
    }
    if (!recommendations.length) {
      recommendations.push('Maintain momentum with a 30-60-90 execution roadmap focused on your top strategic priority.');
    }

    const company = input.company ?? {};

    return {
      generatedAt: new Date().toISOString(),
      packageKey: input.packageKey,
      company: {
        name: typeof company.name === 'string' ? company.name : 'Unknown',
        country: typeof company.country === 'string' ? company.country : 'Unknown',
        industry: typeof company.industry === 'string' ? company.industry : 'Unknown',
        stage: typeof company.stage === 'string' ? company.stage : 'Unknown',
      },
      overallScore,
      readinessBand,
      dimensions,
      topConstraints,
      recommendations,
      strategicPriority: input.strategicPriority,
      planningHorizon: input.planningHorizon,
      notes: input.notes,
    };
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

    const reportSummary =
      input.report && typeof input.report.summary === 'object' && input.report.summary
        ? (input.report.summary as Record<string, unknown>)
        : {};

    const dynamicReport = this.buildDynamicReport({
      packageKey: input.packageKey,
      company: input.company,
      answers: input.answers,
      strategicPriority:
        typeof reportSummary.strategicPriority === 'string'
          ? reportSummary.strategicPriority
          : 'Revenue acceleration',
      planningHorizon:
        typeof reportSummary.planningHorizon === 'string' ? reportSummary.planningHorizon : '12 months',
      notes: typeof reportSummary.notes === 'string' ? reportSummary.notes.trim() : '',
    });

    const now = new Date();
    await this.prisma.$executeRaw`
      UPDATE "twin_assessments"
      SET "report" = ${JSON.stringify(dynamicReport)}::jsonb,
          "updatedAt" = ${now}
      WHERE "id" = ${updated.id}
    `;

    await this.writeAudit('TWIN_ASSESSMENT_COMPLETE', updated.id, {
      packageKey: updated.packageKey,
      completedAt: now.toISOString(),
    });

    return {
      ...updated,
      report: dynamicReport,
    };
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
