import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchService } from './match.service';
import { RunMatchDto, BookCallDto } from './match.dto';
import { Request } from 'express';

@ApiTags('match')
@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post('run')
  @ApiOperation({ summary: 'Run AI match — persist session, return scored pool' })
  async run(@Body() dto: RunMatchDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress;
    return {
      success: true,
      data: await this.matchService.runMatch(dto, ip),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('book-call')
  @ApiOperation({ summary: 'Book a Discovery Call for a match session' })
  async bookCall(@Body() dto: BookCallDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress;
    return {
      success: true,
      data: await this.matchService.bookCall(dto, ip),
      timestamp: new Date().toISOString(),
    };
  }
}
