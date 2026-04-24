import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User as CurrentUser } from '../../common/decorators/user.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountSchema, UpdateAccountSchema } from './accounts.dto';

@ApiTags('accounts')
@Controller('accounts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List current user accounts' })
  async list(@CurrentUser('sub') userId: string) {
    return {
      success: true,
      data: await this.accountsService.listByOwner(userId),
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by id' })
  async get(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return {
      success: true,
      data: await this.accountsService.getById(userId, id),
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create account' })
  async create(@CurrentUser('sub') userId: string, @Body() payload: unknown) {
    try {
      const dto = CreateAccountSchema.parse(payload);
      return {
        success: true,
        data: await this.accountsService.create(userId, dto),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid payload');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() payload: unknown,
  ) {
    try {
      const dto = UpdateAccountSchema.parse(payload);
      return {
        success: true,
        data: await this.accountsService.update(userId, id, dto),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Invalid payload');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  async remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return {
      success: true,
      data: await this.accountsService.remove(userId, id),
      timestamp: new Date().toISOString(),
    };
  }
}
