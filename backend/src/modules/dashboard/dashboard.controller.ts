import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard summary, optionally personalised by assessmentId' })
  @ApiQuery({ name: 'assessmentId', required: false })
  async getOverview(@Query('assessmentId') assessmentId?: string) {
    return {
      success: true,
      data: await this.dashboardService.getSummary(assessmentId),
      timestamp: new Date().toISOString(),
    };
  }
}
