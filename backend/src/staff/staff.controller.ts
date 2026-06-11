import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { UpdateStaffDto, StaffResponseDto } from './dto/staff.dto';

@ApiTags('staff')
@ApiBearerAuth()
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empleado por ID' })
  @ApiOkResponse({ type: StaffResponseDto })
  findOne(@Param('id') id: string): Promise<StaffResponseDto> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar perfil de empleado' })
  @ApiOkResponse({ type: StaffResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    return this.staffService.update(id, dto);
  }
}
