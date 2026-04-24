import {
  BadRequestException,
  Controller,
  Get,
  MessageEvent,
  Query,
  Res,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { interval, map, Observable, startWith, take } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { ReportRangeSchema, RealtimeEventPayload } from './reports.dto';
import { ReportsService } from './reports.service';
import { User as CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('reports')
@Controller('reports')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('stream-token')
  @ApiOperation({ summary: 'Create short-lived token for reports SSE stream' })
  createStreamToken(@CurrentUser() user: { sub: string; email?: string; role?: string }) {
    const nonce = randomUUID();
    const jti = randomUUID();
    const token = this.jwtService.sign(
      {
        sub: user.sub,
        email: user.email,
        role: user.role,
        type: 'stream',
        nonce,
        jti,
      },
      {
        expiresIn: '2m',
        audience: 'reports-sse',
        secret: process.env.STREAM_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key',
      },
    );

    return {
      success: true,
      data: {
        streamToken: token,
        nonce,
        expiresInSeconds: 120,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get reporting summary and trend points' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'] })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'industry', required: false, type: String })
  @ApiQuery({ name: 'stage', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getSummary(
    @Query('range') range: string | undefined,
    @Query('country') country: string | undefined,
    @Query('industry') industry: string | undefined,
    @Query('stage') stage: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
  ) {
    const parsed = ReportRangeSchema.safeParse({
      range: range ?? '30d',
      country,
      industry,
      stage,
      page: page ?? '1',
      limit: limit ?? '30',
    });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid range');
    }

    return {
      success: true,
      data: this.reportsService.getSummary(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export report as CSV' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'] })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'industry', required: false, type: String })
  @ApiQuery({ name: 'stage', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiProduces('text/csv')
  exportCsv(
    @Query('range') range: string | undefined,
    @Query('country') country: string | undefined,
    @Query('industry') industry: string | undefined,
    @Query('stage') stage: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Res() res: Response,
  ) {
    const parsed = ReportRangeSchema.safeParse({
      range: range ?? '30d',
      country,
      industry,
      stage,
      page: page ?? '1',
      limit: limit ?? '30',
    });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid range');
    }

    const summary = this.reportsService.getSummary(parsed.data);
    const csv = this.reportsService.toCsv(summary);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="wingrox-report-${parsed.data.range}.csv"`);
    res.send(csv);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export report as PDF' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'] })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'industry', required: false, type: String })
  @ApiQuery({ name: 'stage', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiProduces('application/pdf')
  async exportPdf(
    @Query('range') range: string | undefined,
    @Query('country') country: string | undefined,
    @Query('industry') industry: string | undefined,
    @Query('stage') stage: string | undefined,
    @Query('page') page: string | undefined,
    @Query('limit') limit: string | undefined,
    @Res() res: Response,
  ) {
    const parsed = ReportRangeSchema.safeParse({
      range: range ?? '30d',
      country,
      industry,
      stage,
      page: page ?? '1',
      limit: limit ?? '30',
    });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid range');
    }

    const summary = this.reportsService.getSummary(parsed.data);
    const pdf = await this.reportsService.toPdfBuffer(summary);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="wingrox-report-${parsed.data.range}.pdf"`);
    res.send(pdf);
  }

  @Get('segments')
  @ApiOperation({ summary: 'Get segmented reporting analytics' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'] })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'industry', required: false, type: String })
  @ApiQuery({ name: 'stage', required: false, type: String })
  getSegments(
    @Query('range') range: string | undefined,
    @Query('country') country: string | undefined,
    @Query('industry') industry: string | undefined,
    @Query('stage') stage: string | undefined,
  ) {
    const parsed = ReportRangeSchema.safeParse({
      range: range ?? '30d',
      country,
      industry,
      stage,
      page: '1',
      limit: '30',
    });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid report query');
    }

    return {
      success: true,
      data: this.reportsService.getSegments(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Sse('realtime')
  @ApiOperation({ summary: 'Realtime report updates via server-sent events' })
  streamRealtime(@Query('once') once: string | undefined): Observable<MessageEvent> {
    const stream$ = interval(5000).pipe(
      startWith(0),
      map((tick) => {
        const payload: RealtimeEventPayload = {
          type: tick === 0 ? 'heartbeat' : 'metric-update',
          ts: new Date().toISOString(),
          data:
            tick === 0
              ? { status: 'connected' }
              : {
                  pipelineEur: 180000 + Math.floor(Math.random() * 3000),
                  matches: 42 + Math.floor(Math.random() * 3),
                },
        };

        return {
          data: payload,
        };
      }),
    );

    return once === '1' ? stream$.pipe(take(1)) : stream$;
  }
}
