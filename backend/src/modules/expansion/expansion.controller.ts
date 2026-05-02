import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateLeadSchema,
  GenerateAssessmentSchema,
  ListAssessmentsSchema,
  ListCountriesSchema,
  ListLeadsSchema,
  ListSignalsSchema,
} from './expansion.dto';
import { ExpansionService } from './expansion.service';

@ApiTags('expansion')
@Controller('expansion')
export class ExpansionController {
  constructor(private readonly expansionService: ExpansionService) {}

  // ---------- Public reads ----------

  @Get('countries')
  @ApiOperation({ summary: 'List reference markets used for expansion scoring' })
  async countries(@Query() query: Record<string, unknown>) {
    const parsed = ListCountriesSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid query');
    }
    return {
      success: true,
      data: await this.expansionService.listCountries(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('signals')
  @ApiOperation({ summary: 'List live intelligence signals (multi-filter)' })
  async signals(@Query() query: Record<string, unknown>) {
    const parsed = ListSignalsSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid query');
    }
    return {
      success: true,
      data: await this.expansionService.listSignals(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  // ---------- Lead-magnet flows ----------

  @Post('assessment')
  @ApiOperation({ summary: 'Generate Global Expansion Intelligence Report' })
  async assessment(@Body() body: unknown, @Ip() ip: string) {
    const parsed = GenerateAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid payload');
    }
    return {
      success: true,
      data: await this.expansionService.generateAssessment(parsed.data, ip),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('leads')
  @ApiOperation({ summary: 'Capture a lead from the intel demo / sample / call modal' })
  async lead(@Body() body: unknown, @Ip() ip: string) {
    const parsed = CreateLeadSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid payload');
    }
    return {
      success: true,
      data: await this.expansionService.createLead(parsed.data, ip),
      timestamp: new Date().toISOString(),
    };
  }

  // ---------- Admin ----------

  @Get('admin/assessments')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Admin list of expansion assessments' })
  async adminAssessments(@Query() query: Record<string, unknown>) {
    const parsed = ListAssessmentsSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid query');
    }
    return {
      success: true,
      data: await this.expansionService.listAssessments(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin/leads')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Admin list of expansion intel leads' })
  async adminLeads(@Query() query: Record<string, unknown>) {
    const parsed = ListLeadsSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid query');
    }
    return {
      success: true,
      data: await this.expansionService.listLeads(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }
}
