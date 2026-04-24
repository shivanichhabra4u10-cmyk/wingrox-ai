import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ReportRangeDTO, ReportsSegmentsResponse, ReportsSummaryResponse, SegmentItem } from './reports.dto';

@Injectable()
export class ReportsService {
  private readonly cacheTtlMs = 30_000;
  private readonly summaryCache = new Map<string, { ts: number; data: ReportsSummaryResponse }>();
  private readonly segmentCache = new Map<string, { ts: number; data: ReportsSegmentsResponse }>();

  getSummary(input: ReportRangeDTO): ReportsSummaryResponse {
    const { range, country, industry, stage, page, limit } = input;
    const key = JSON.stringify({ range, country, industry, stage, page, limit });
    const cached = this.summaryCache.get(key);
    if (cached && Date.now() - cached.ts < this.cacheTtlMs) {
      return cached.data;
    }

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const today = new Date();
    const filterBoost = (country ? 1 : 0) + (industry ? 1 : 0) + (stage ? 1 : 0);

    const allTrend = Array.from({ length: days }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - i - 1));

      return {
        date: d.toISOString().slice(0, 10),
        pipeline: 120000 + i * 1700 + filterBoost * 2400,
        matches: 18 + Math.floor(i / 2) + filterBoost,
        conversionRate: Number((4.2 + i * 0.08 + filterBoost * 0.12).toFixed(2)),
      };
    });

    const start = (page - 1) * limit;
    const trend = allTrend.slice(start, start + limit);

    const pipelineEur = allTrend[allTrend.length - 1]?.pipeline ?? 0;
    const matches = allTrend[allTrend.length - 1]?.matches ?? 0;
    const avgConversionRate = Number(
      (allTrend.reduce((acc, p) => acc + p.conversionRate, 0) / allTrend.length).toFixed(2),
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
      trend,
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

  getSegments(input: ReportRangeDTO): ReportsSegmentsResponse {
    const { range, country, industry, stage } = input;
    const key = JSON.stringify({ range, country, industry, stage });
    const cached = this.segmentCache.get(key);
    if (cached && Date.now() - cached.ts < this.cacheTtlMs) {
      return cached.data;
    }

    const boost = (country ? 1 : 0) + (industry ? 1 : 0) + (stage ? 1 : 0);
    const mk = (keyName: string, base: number, idx: number): SegmentItem => ({
      key: keyName,
      pipelineEur: base + idx * 18_000 + boost * 2_500,
      matches: 10 + idx * 3 + boost,
      avgConversionRate: Number((4.1 + idx * 0.45 + boost * 0.12).toFixed(2)),
    });

    const data: ReportsSegmentsResponse = {
      byCountry: [mk('Germany', 210_000, 1), mk('Netherlands', 170_000, 2), mk('UK', 195_000, 3)],
      byIndustry: [mk('SaaS', 240_000, 1), mk('Manufacturing', 185_000, 2), mk('Fintech', 165_000, 3)],
      byStage: [mk('Seed', 150_000, 1), mk('Series A', 220_000, 2), mk('Growth', 260_000, 3)],
    };

    this.segmentCache.set(key, { ts: Date.now(), data });
    return data;
  }
}
