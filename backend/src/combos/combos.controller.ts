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
import { CombosService } from './combos.service';
import {
  CreateComboDto,
  UpdateComboDto,
  ComboResponseDto,
  DishReferenceResponseDto,
} from './dto/combo.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';

@ApiTags('combos')
@ApiBearerAuth()
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar combos' })
  @ApiOkResponse({ type: [ComboResponseDto] })
  findAll(): Promise<ComboResponseDto[]> {
    return this.combosService.findAll();
  }

  @Get('dish-references/:dishId')
  @ApiOperation({ summary: 'Verificar si un platillo está en combos' })
  @ApiOkResponse({ type: DishReferenceResponseDto })
  async dishReferences(
    @Param('dishId') dishId: string,
  ): Promise<DishReferenceResponseDto> {
    const referenced = await this.combosService.isDishReferenced(dishId);
    return { referenced };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener combo por ID' })
  @ApiOkResponse({ type: ComboResponseDto })
  findOne(@Param('id') id: string): Promise<ComboResponseDto> {
    return this.combosService.findOne(id);
  }

  @Post()
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Crear combo' })
  @ApiOkResponse({ type: ComboResponseDto })
  create(@Body() dto: CreateComboDto): Promise<ComboResponseDto> {
    return this.combosService.create(dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Actualizar combo' })
  @ApiOkResponse({ type: ComboResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateComboDto,
  ): Promise<ComboResponseDto> {
    return this.combosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Eliminar combo' })
  remove(@Param('id') id: string): Promise<void> {
    return this.combosService.remove(id);
  }
}
