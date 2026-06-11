import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import {
  CreateMenuEntryDto,
  UpdateMenuEntryDto,
  MenuEntryResponseDto,
} from './dto/menu.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';

@ApiTags('menu')
@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener menú enriquecido por fecha' })
  @ApiQuery({ name: 'date', required: true, example: '2026-06-10' })
  @ApiOkResponse({ type: [MenuEntryResponseDto] })
  getMenu(@Query('date') date: string): Promise<MenuEntryResponseDto[]> {
    return this.menuService.getEnrichedMenu(date);
  }

  @Post(':date/entries')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Agregar entrada al menú del día' })
  @ApiOkResponse({ type: MenuEntryResponseDto })
  addEntry(
    @Param('date') date: string,
    @Body() dto: CreateMenuEntryDto,
  ): Promise<MenuEntryResponseDto> {
    return this.menuService.addEntry(date, dto);
  }

  @Patch(':date/entries/:id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Actualizar entrada del menú' })
  @ApiOkResponse({ type: MenuEntryResponseDto })
  updateEntry(
    @Param('date') date: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuEntryDto,
  ): Promise<MenuEntryResponseDto> {
    return this.menuService.updateEntry(date, id, dto);
  }

  @Delete(':date/entries/:id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Eliminar entrada del menú' })
  removeEntry(@Param('date') date: string, @Param('id') id: string): Promise<void> {
    return this.menuService.removeEntry(date, id);
  }
}
