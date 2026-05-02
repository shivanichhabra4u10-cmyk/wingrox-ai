import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EcoService } from './eco.service';
import { ApplyDto } from './eco.dto';
import { Request } from 'express';

@ApiTags('eco')
@Controller('eco')
export class EcoController {
  constructor(private readonly ecoService: EcoService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submit an ecosystem partner application' })
  async apply(@Body() dto: ApplyDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress;
    return {
      success: true,
      data: await this.ecoService.apply(dto, ip),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check application status by email' })
  @ApiQuery({ name: 'email', required: true })
  async status(@Query('email') email: string) {
    return {
      success: true,
      data: await this.ecoService.getStatus(email),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get ecosystem partner counts' })
  async stats() {
    return {
      success: true,
      data: await this.ecoService.getStats(),
      timestamp: new Date().toISOString(),
    };
  }
}
