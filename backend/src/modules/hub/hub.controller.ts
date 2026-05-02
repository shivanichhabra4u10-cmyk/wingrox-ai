import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HubService } from './hub.service';
import { SaveArticleDto } from './hub.dto';

@ApiTags('hub')
@Controller('hub')
export class HubController {
  constructor(private readonly hubService: HubService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Get personalised hub feed, optionally by assessmentId + sessionId' })
  @ApiQuery({ name: 'assessmentId', required: false })
  @ApiQuery({ name: 'sessionId', required: false })
  async getFeed(
    @Query('assessmentId') assessmentId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return {
      success: true,
      data: await this.hubService.getFeed(assessmentId, sessionId),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('save')
  @ApiOperation({ summary: 'Toggle save/unsave an article for an anonymous session' })
  async save(@Body() dto: SaveArticleDto) {
    return {
      success: true,
      data: await this.hubService.toggleSave(dto),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('saves')
  @ApiOperation({ summary: 'Get all saved article slugs for a session' })
  @ApiQuery({ name: 'sessionId', required: true })
  async getSaves(@Query('sessionId') sessionId: string) {
    return {
      success: true,
      data: await this.hubService.getSaves(sessionId),
      timestamp: new Date().toISOString(),
    };
  }
}
