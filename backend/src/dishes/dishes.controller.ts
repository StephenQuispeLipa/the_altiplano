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
import { DishesService } from './dishes.service';
import { CreateDishDto, UpdateDishDto, DishResponseDto } from './dto/dish.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';

@ApiTags('dishes')
@ApiBearerAuth()
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar platillos' })
  @ApiOkResponse({ type: [DishResponseDto] })
  findAll(): Promise<DishResponseDto[]> {
    return this.dishesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener platillo por ID' })
  @ApiOkResponse({ type: DishResponseDto })
  findOne(@Param('id') id: string): Promise<DishResponseDto> {
    return this.dishesService.findOne(id);
  }

  @Post()
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Crear platillo' })
  @ApiOkResponse({ type: DishResponseDto })
  create(@Body() dto: CreateDishDto): Promise<DishResponseDto> {
    return this.dishesService.create(dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Actualizar platillo' })
  @ApiOkResponse({ type: DishResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDishDto,
  ): Promise<DishResponseDto> {
    return this.dishesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Eliminar platillo' })
  remove(@Param('id') id: string): Promise<void> {
    return this.dishesService.remove(id);
  }
}
