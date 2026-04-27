import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import {
  CompleteAssessmentSchema,
  ListAssessmentsSchema,
  SaveProgressSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from './twin-assessment.dto';
import { TwinAssessmentService } from './twin-assessment.service';

@ApiTags('twin-assessment')
@Controller('twin-assessment')
export class TwinAssessmentController {
  constructor(private readonly twinAssessmentService: TwinAssessmentService) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to start Twin assessment' })
  async sendOtp(@Body() body: unknown) {
    const parsed = SendOtpSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid payload');
    }

    return {
      success: true,
      data: await this.twinAssessmentService.sendOtp(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and create Twin assessment session token' })
  async verifyOtp(@Body() body: unknown) {
    const parsed = VerifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid payload');
    }

    return {
      success: true,
      data: await this.twinAssessmentService.verifyOtp(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('progress')
  @ApiOperation({ summary: 'Save incremental Twin assessment progress' })
  async saveProgress(@Body() body: unknown) {
    const parsed = SaveProgressSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid payload');
    }

    return {
      success: true,
      data: await this.twinAssessmentService.saveProgress(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('complete')
  @ApiOperation({ summary: 'Persist completed Twin assessment report' })
  async complete(@Body() body: unknown) {
    const parsed = CompleteAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid payload');
    }

    return {
      success: true,
      data: await this.twinAssessmentService.completeAssessment(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin/list')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Admin list of Twin assessments' })
  async adminList(@Query() query: Record<string, unknown>) {
    const parsed = ListAssessmentsSchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors[0]?.message ?? 'Invalid query');
    }

    return {
      success: true,
      data: await this.twinAssessmentService.listAssessments(parsed.data),
      timestamp: new Date().toISOString(),
    };
  }
}
