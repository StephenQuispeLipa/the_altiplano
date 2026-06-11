import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccessLogService } from './access-log.service';
import { AccessLogListResponseDto } from './dto/access-log.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';
import { AccessEvent } from '../common/enums/access-event.enum';

@ApiTags('access-logs')
@ApiBearerAuth()
@Roles(AppRole.Admin)
@Controller('access-logs')
export class AccessLogsController {
  constructor(private readonly accessLogService: AccessLogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs de acceso (solo Admin)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'event', required: false, enum: AccessEvent })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOkResponse({ type: AccessLogListResponseDto })
  findAll(
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('event') event?: AccessEvent,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<AccessLogListResponseDto> {
    return this.accessLogService.findAll({
      userId,
      email,
      event,
      from,
      to,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
