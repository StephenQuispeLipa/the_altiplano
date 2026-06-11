import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientResponseDto,
} from './dto/client.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrdersService } from '../orders/orders.service';
import { OrderResponseDto } from '../orders/dto/order.dto';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Camarero)
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiOkResponse({ type: [ClientResponseDto] })
  findAll(): Promise<ClientResponseDto[]> {
    return this.clientsService.findAll();
  }

  @Get('me/orders')
  @Roles(AppRole.Cliente)
  @ApiOperation({ summary: 'Historial de pedidos del cliente autenticado' })
  @ApiOkResponse({ type: [OrderResponseDto] })
  myOrders(@Req() req: { user: JwtPayload }): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll({ clientId: req.user.sub });
  }

  @Get(':id')
  @Roles(AppRole.Admin, AppRole.Camarero, AppRole.Cliente)
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiOkResponse({ type: ClientResponseDto })
  findOne(@Param('id') id: string): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Camarero)
  @ApiOperation({ summary: 'Registrar cliente' })
  @ApiOkResponse({ type: ClientResponseDto })
  create(@Body() dto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  @ApiOkResponse({ type: ClientResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.update(id, dto);
  }
}
