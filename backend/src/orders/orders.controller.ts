import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
  UpdateOrderPaidDto,
} from './dto/order.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrderStatus } from '../common/enums/order-status.enum';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Camarero, AppRole.Cliente)
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  findAll(
    @Req() req: { user: JwtPayload },
    @Query('status') status?: OrderStatus,
    @Query('clientId') clientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll(
      { status, clientId, from, to },
      req.user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @ApiOkResponse({ type: OrderResponseDto })
  findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Camarero, AppRole.Cliente)
  @ApiOperation({ summary: 'Crear pedido (transaccional)' })
  @ApiOkResponse({ type: OrderResponseDto })
  create(
    @Body() dto: CreateOrderDto,
    @Req() req: { user: JwtPayload },
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(dto, req.user);
  }

  @Patch(':id/status')
  @Roles(AppRole.Admin, AppRole.Camarero)
  @ApiOperation({ summary: 'Actualizar estado del pedido' })
  @ApiOkResponse({ type: OrderResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto);
  }

  @Patch(':id/paid')
  @Roles(AppRole.Admin, AppRole.Camarero)
  @ApiOperation({ summary: 'Actualizar estado de pago' })
  @ApiOkResponse({ type: OrderResponseDto })
  updatePaid(
    @Param('id') id: string,
    @Body() dto: UpdateOrderPaidDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updatePaid(id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  @ApiOperation({ summary: 'Eliminar pedido (solo Admin)' })
  remove(
    @Param('id') id: string,
    @Req() req: { user: JwtPayload },
  ): Promise<void> {
    return this.ordersService.remove(id, req.user);
  }
}
