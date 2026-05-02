import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SimService } from './sim.service';
import { SaveRunDto, UnlockDto } from './sim.dto';

@ApiTags('sim')
@Controller('sim')
export class SimController {
  constructor(private readonly simService: SimService) {}

  @Post('run')
  @ApiOperation({ summary: 'Persist a simulator run (inputs + outputs snapshot)' })
  async saveRun(@Body() dto: SaveRunDto) {
    return {
      success: true,
      data: await this.simService.saveRun(dto),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('last')
  @ApiOperation({ summary: 'Get the most recent sim run for a session (to restore inputs)' })
  @ApiQuery({ name: 'sessionId', required: true })
  async getLast(@Query('sessionId') sessionId: string) {
    return {
      success: true,
      data: await this.simService.getLastRun(sessionId),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('unlock')
  @ApiOperation({ summary: 'Record a simulator unlock (paywall cleared)' })
  async unlock(@Body() dto: UnlockDto) {
    return {
      success: true,
      data: await this.simService.unlock(dto),
      timestamp: new Date().toISOString(),
    };
  }
}
