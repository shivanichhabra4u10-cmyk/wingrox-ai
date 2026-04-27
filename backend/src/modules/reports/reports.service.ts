import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../common/prisma.service';
import { ReportRangeDTO, ReportsSegmentsResponse, ReportsSummaryResponse, SegmentItem } from './reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly cacheTtlMs = 30_000;
  private readonly summaryCache = new Map<string, { ts: number; data: ReportsSummaryResponse }>();
  private readonly segmentCache = new Map<string, { ts: number; data: ReportsSegmentsResponse }>();

  private buildFilterSql(input: ReportRangeDTO, alias = 't'): Prisma.Sql {
    const filters: Prisma.Sql[] = [];
    const days = input.range === '7d' ? 7 : input.range === '90d' ? 90 : 30;

    filters.push(Prisma.sql`${Prisma.raw(alias)}."createdAt" >= NOW() - (${days} - 1) * INTERVAL '1 day'`);

    if (input.country) {
      filters.push(Prisma.sql`COALESCE(${Prisma.raw(alias)}."company"->>'country', '') = ${input.country}`);
    }
    if (input.industry) {
      filters.push(Prisma.sql`COALESCE(${Prisma.raw(alias)}."company"->>'industry', '') = ${input.industry}`);
    }
    if (input.stage) {
      filters.push(Prisma.sql`COALESCE(${Prisma.raw(alias)}."company"->>'stage', '') = ${input.stage}`);
    }

    return filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}` : Prisma.sql``;
  }

  private packageValueSql(alias = 't') {
    return Prisma.sql`
      CASE ${Prisma.raw(alias)}."packageKey"
        WHEN 'nucleus' THEN 0
        WHEN 'catalyst' THEN 99
        WHEN 'vanguard' THEN 199
        WHEN 'apex' THEN 499
        ELSE 0
      END
    `;
  }

  private jsonFieldSql(field: 'country' | 'industry' | 'stage') {
    return Prisma.raw(`'${field}'`);
  }

  async getSummary(input: ReportRangeDTO): Promise<ReportsSummaryResponse> {
    const { range, country, industry, stage, page, limit } = input;
    const key = JSON.stringify({ range, country, industry, stage, page, limit });
    const cached = this.summaryCache.get(key);
    if (cached && Date.now() - cached.ts < this.cacheTtlMs) {
      return cached.data;
    }

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const whereClause = this.buildFilterSql(input);
    const packageValue = this.packageValueSql();

    const allTrend = await this.prisma.$queryRaw<
      Array<{ date: string; pipeline: number; matches: bigint; conversionRate: number }>
    >`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', NOW() - (${days} - 1) * INTERVAL '1 day'),
          date_trunc('day', NOW()),
          INTERVAL '1 day'
        )::date AS day
      ),
      agg AS (
        SELECT
          DATE("createdAt") AS day,
          SUM(${packageValue})::int AS pipeline,
          COUNT(*) FILTER (WHERE "status" = 'COMPLETED')::bigint AS matches,
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE "status" = 'COMPLETED')::numeric / COUNT(*)::numeric) * 100, 2)
          END AS "conversionRate"
        FROM "twin_assessments" t
        ${whereClause}
        GROUP BY DATE("createdAt")
      )
      SELECT
        TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
        COALESCE(agg.pipeline, 0)::int AS pipeline,
        COALESCE(agg.matches, 0)::bigint AS matches,
        COALESCE(agg."conversionRate", 0)::float8 AS "conversionRate"
      FROM days
      LEFT JOIN agg ON agg.day = days.day
      ORDER BY days.day ASC
    `;

    const start = (page - 1) * limit;
    const trend = allTrend.slice(start, start + limit);

    const pipelineEur = allTrend.reduce((sum, point) => sum + point.pipeline, 0);
    const matches = allTrend.reduce((sum, point) => sum + Number(point.matches), 0);
    const avgConversionRate = Number(
      ((allTrend.reduce((acc, p) => acc + p.conversionRate, 0) || 0) / Math.max(allTrend.length, 1)).toFixed(2),
    );

    const summary: ReportsSummaryResponse = {
      range,
      filters: {
        country,
        industry,
        stage,
      },
      pagination: {
        page,
        limit,
        totalPoints: allTrend.length,
        hasMore: start + trend.length < allTrend.length,
      },
      totals: {
        pipelineEur,
        matches,
        avgConversionRate,
      },
      trend: trend.map((point) => ({
        date: point.date,
        pipeline: point.pipeline,
        matches: Number(point.matches),
        conversionRate: point.conversionRate,
      })),
    };

    this.summaryCache.set(key, { ts: Date.now(), data: summary });
    return summary;
  }

  toCsv(summary: ReportsSummaryResponse): string {
    const header = ['date', 'pipeline_eur', 'matches', 'conversion_rate'];
    const rows = summary.trend.map((p) => [p.date, String(p.pipeline), String(p.matches), String(p.conversionRate)]);
    return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  async toPdfBuffer(summary: ReportsSummaryResponse): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 42 });
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      doc.fontSize(20).text('WinGroX AI Report', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Range: ${summary.range}`);
      doc.text(`Pipeline (EUR): ${summary.totals.pipelineEur}`);
      doc.text(`Matches: ${summary.totals.matches}`);
      doc.text(`Avg Conversion Rate: ${summary.totals.avgConversionRate}%`);
      doc.moveDown();
      doc.text(
        `Filters: country=${summary.filters.country ?? 'all'}, industry=${summary.filters.industry ?? 'all'}, stage=${summary.filters.stage ?? 'all'}`,
      );
      doc.text(
        `Pagination: page=${summary.pagination.page}, limit=${summary.pagination.limit}, total=${summary.pagination.totalPoints}`,
      );
      doc.moveDown();
      doc.text('Trend Snapshot (first 10 points):');
      summary.trend.slice(0, 10).forEach((p) => {
        doc.text(`${p.date} | pipeline=${p.pipeline} | matches=${p.matches} | conv=${p.conversionRate}%`);
      });

      doc.end();
    });
  }

  async getSegments(input: ReportRangeDTO): Promise<ReportsSegmentsResponse> {
    const { range, country, industry, stage } = input;
    const key = JSON.stringify({ range, country, industry, stage });
    const cached = this.segmentCache.get(key);
    if (cached && Date.now() - cached.ts < this.cacheTtlMs) {
      return cached.data;
    }

    const packageValue = this.packageValueSql();
    const whereClause = this.buildFilterSql(input);

    const queryFor = async (field: 'country' | 'industry' | 'stage') => {
      const jsonField = this.jsonFieldSql(field);
      const rows = await this.prisma.$queryRaw<Array<{ key: string; pipelineEur: number; matches: bigint; avgConversionRate: number }>>`
        SELECT
          COALESCE(NULLIF(t."company"->>${jsonField}, ''), 'Unknown') AS key,
          SUM(${packageValue})::int AS "pipelineEur",
          COUNT(*) FILTER (WHERE t."status" = 'COMPLETED')::bigint AS matches,
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE t."status" = 'COMPLETED')::numeric / COUNT(*)::numeric) * 100, 2)
          END::float8 AS "avgConversionRate"
        FROM "twin_assessments" t
        ${whereClause}
        GROUP BY 1
        ORDER BY "pipelineEur" DESC, matches DESC
        LIMIT 6
      `;

      return rows.map<SegmentItem>((row) => ({
        key: row.key,
        pipelineEur: row.pipelineEur,
        matches: Number(row.matches),
        avgConversionRate: row.avgConversionRate,
      }));
    };

    const data: ReportsSegmentsResponse = {
      byCountry: await queryFor('country'),
      byIndustry: await queryFor('industry'),
      byStage: await queryFor('stage'),
    };

    this.segmentCache.set(key, { ts: Date.now(), data });
    return data;
  }
}
