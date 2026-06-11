import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateStaffUserDto,
  UpdateStaffUserDto,
  StaffUserResponseDto,
} from './dto/staff-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';

@ApiTags('users')
@ApiBearerAuth()
@Roles(AppRole.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('staff')
  @ApiOperation({ summary: 'Listar usuarios staff' })
  @ApiOkResponse({ type: [StaffUserResponseDto] })
  findAllStaff(): Promise<StaffUserResponseDto[]> {
    return this.usersService.findAllStaff();
  }

  @Post('staff')
  @ApiOperation({ summary: 'Crear usuario staff' })
  @ApiOkResponse({ type: StaffUserResponseDto })
  createStaff(@Body() dto: CreateStaffUserDto): Promise<StaffUserResponseDto> {
    return this.usersService.createStaff(dto);
  }

  @Patch('staff/:id')
  @ApiOperation({ summary: 'Actualizar usuario staff' })
  @ApiOkResponse({ type: StaffUserResponseDto })
  updateStaff(
    @Param('id') id: string,
    @Body() dto: UpdateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    return this.usersService.updateStaff(id, dto);
  }

  @Delete('staff/:id')
  @ApiOperation({ summary: 'Eliminar usuario staff' })
  removeStaff(@Param('id') id: string): Promise<void> {
    return this.usersService.removeStaff(id);
  }
}
