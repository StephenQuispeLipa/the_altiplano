import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, FindOptionsWhere, EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuEntry } from '../menu/entities/menu-entry.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { Combo } from '../combos/entities/combo.entity';
import { ComboSlot } from '../combos/entities/combo-slot.entity';
import { Client } from '../clients/entities/client.entity';
import { Staff } from '../staff/entities/staff.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { AppRole } from '../common/enums/app-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
  UpdateOrderPaidDto,
} from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(MenuEntry)
    private readonly menuRepo: Repository<MenuEntry>,
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
    @InjectRepository(Combo) private readonly comboRepo: Repository<Combo>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    private readonly dataSource: DataSource,
  ) {}

  private todayISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private async applyMenuStockDelta(
    manager: EntityManager,
    dishId: string,
    qty: number,
    today: string,
  ): Promise<void> {
    const menuEntry = await manager.findOne(MenuEntry, {
      where: { menuDate: today, dishId },
      relations: { dish: true },
    });
    if (!menuEntry?.dish) {
      throw new BadRequestException(`Platillo ${dishId} no disponible en menú`);
    }

    menuEntry.stock -= qty;
    menuEntry.soldToday += qty;
    await manager.save(menuEntry);

    menuEntry.dish.totalOrdersHistory += qty;
    await manager.save(menuEntry.dish);
  }

  private async restoreMenuStockDelta(
    manager: EntityManager,
    dishId: string,
    qty: number,
    menuDate: string,
  ): Promise<void> {
    const menuEntry = await manager.findOne(MenuEntry, {
      where: { menuDate, dishId },
      relations: { dish: true },
    });
    if (!menuEntry?.dish) return;

    menuEntry.stock += qty;
    menuEntry.soldToday = Math.max(0, menuEntry.soldToday - qty);
    await manager.save(menuEntry);

    menuEntry.dish.totalOrdersHistory = Math.max(0, menuEntry.dish.totalOrdersHistory - qty);
    await manager.save(menuEntry.dish);
  }

  private readonly clientCancellableStatuses: OrderStatus[] = [
    OrderStatus.EnReserva,
    OrderStatus.EnPreparacion,
    OrderStatus.Atrasado,
  ];

  toResponse(order: Order, items: OrderItem[]): OrderResponseDto {
    return {
      id: order.id,
      clientId: order.clientId,
      createdBy: order.createdByName,
      detalle_platos: items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          id: item.dishId ?? item.comboId ?? item.id,
          name: item.name,
          price: Number(item.price),
          type: item.type,
        })),
      ),
      total: Number(order.total),
      status: order.status,
      isPaid: order.isPaid,
      isTakeaway: order.isTakeaway,
      location: order.location,
      createdAt: order.createdAt.getTime(),
    };
  }

  async findAll(
    filters: {
      status?: OrderStatus;
      clientId?: string;
      from?: string;
      to?: string;
    } = {},
    user?: JwtPayload,
  ): Promise<OrderResponseDto[]> {
    const where: FindOptionsWhere<Order> = {};
    if (filters.status) where.status = filters.status;

    if (user?.role === AppRole.Cliente) {
      where.clientId = user.sub;
    } else if (filters.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters.from && filters.to) {
      where.createdAt = Between(new Date(filters.from), new Date(filters.to));
    }

    const orders = await this.orderRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      orders.map(async (order) => {
        const items = await this.orderItemRepo.find({ where: { orderId: order.id } });
        return this.toResponse(order, items);
      }),
    );
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    const items = await this.orderItemRepo.find({ where: { orderId: id } });
    return this.toResponse(order, items);
  }

  async create(dto: CreateOrderDto, user: JwtPayload): Promise<OrderResponseDto> {
    const today = this.todayISO();
    let createdByName = 'Auto';
    let createdByStaffId: string | null = null;
    let clientId = dto.clientId ?? null;

    if (user.role === AppRole.Cliente) {
      clientId = user.sub;
      createdByName = 'Auto';
    } else if (user.userType === 'staff') {
      const staff = await this.staffRepo.findOne({ where: { id: user.sub } });
      createdByName = staff?.name ?? 'Staff';
      createdByStaffId = user.sub;
    }

    const stockNeeds: Record<string, number> = {};
    for (const line of dto.lines) {
      if (line.type === 'dish' && line.dishId) {
        stockNeeds[line.dishId] = (stockNeeds[line.dishId] ?? 0) + line.quantity;
      } else if (line.type === 'combo' && line.selections) {
        for (const dishId of Object.values(line.selections)) {
          stockNeeds[dishId] = (stockNeeds[dishId] ?? 0) + line.quantity;
        }
      }
    }

    return this.dataSource.transaction(async (manager) => {
      for (const [dishId, qty] of Object.entries(stockNeeds)) {
        const entry = await manager.findOne(MenuEntry, {
          where: { menuDate: today, dishId },
        });
        if (!entry || entry.stock < qty) {
          throw new BadRequestException(`Stock insuficiente para platillo ${dishId}`);
        }
      }

      const orderItems: Partial<OrderItem>[] = [];
      let total = 0;

      for (const line of dto.lines) {
        if (line.type === 'dish' && line.dishId) {
          const menuEntry = await manager.findOne(MenuEntry, {
            where: { menuDate: today, dishId: line.dishId },
            relations: { dish: true },
          });
          const dish = menuEntry?.dish ?? (await manager.findOne(Dish, { where: { id: line.dishId } }));
          if (!dish || !menuEntry) throw new BadRequestException('Platillo no disponible en menú');

          const lineTotal = Number(menuEntry.price) * line.quantity;
          total += lineTotal;
          orderItems.push({
            id: uuidv4(),
            dishId: line.dishId,
            comboId: null,
            name: dish.name,
            price: Number(menuEntry.price),
            type: dish.type,
            quantity: line.quantity,
          });

          await this.applyMenuStockDelta(manager, line.dishId, line.quantity, today);
        } else if (line.type === 'combo' && line.comboId) {
          const combo = await manager.findOne(Combo, { where: { id: line.comboId } });
          if (!combo) throw new BadRequestException('Combo no encontrado');

          const lineTotal = Number(combo.basePrice) * line.quantity;
          total += lineTotal;
          orderItems.push({
            id: uuidv4(),
            dishId: null,
            comboId: line.comboId,
            name: combo.name,
            price: Number(combo.basePrice),
            type: 'Combo',
            quantity: line.quantity,
          });

          const slots = await manager.find(ComboSlot, {
            where: { comboId: line.comboId },
            order: { slotKey: 'ASC' },
          });
          const selections = line.selections ?? {};

          for (const slot of slots) {
            const dishId = selections[slot.id];
            if (dishId) {
              const dish = await manager.findOne(Dish, { where: { id: dishId } });
              if (dish) {
                orderItems.push({
                  id: uuidv4(),
                  dishId,
                  comboId: null,
                  name: dish.name,
                  price: 0,
                  type: dish.type,
                  quantity: line.quantity,
                });
                await this.applyMenuStockDelta(manager, dishId, line.quantity, today);
              } else {
                orderItems.push({
                  id: uuidv4(),
                  dishId: null,
                  comboId: null,
                  name: `Pendiente: ${slot.label}`,
                  price: 0,
                  type: 'Pendiente',
                  quantity: line.quantity,
                });
              }
            } else {
              orderItems.push({
                id: uuidv4(),
                dishId: null,
                comboId: null,
                name: `Pendiente: ${slot.label}`,
                price: 0,
                type: 'Pendiente',
                quantity: line.quantity,
              });
            }
          }
        }
      }

      const orderId = `o${Date.now()}`;
      const order = manager.create(Order, {
        id: orderId,
        clientId,
        createdByStaffId,
        createdByName,
        total,
        status: OrderStatus.EnPreparacion,
        isPaid: false,
        isTakeaway: dto.isTakeaway,
        location: dto.location,
      });
      await manager.save(order);

      for (const item of orderItems) {
        await manager.save(
          manager.create(OrderItem, { ...item, orderId }),
        );
      }

      if (clientId) {
        const client = await manager.findOne(Client, { where: { id: clientId } });
        if (client) {
          client.totalOrdersHistory += 1;
          await manager.save(client);
        }
      }

      const savedItems = await manager.find(OrderItem, { where: { orderId } });
      return this.toResponse(order, savedItems);
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    order.status = dto.status;
    await this.orderRepo.save(order);
    const items = await this.orderItemRepo.find({ where: { orderId: id } });
    return this.toResponse(order, items);
  }

  async cancelByClient(id: string, user: JwtPayload): Promise<OrderResponseDto> {
    if (user.role !== AppRole.Cliente) {
      throw new ForbiddenException('Solo el cliente puede cancelar su pedido.');
    }

    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id } });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      if (order.clientId !== user.sub) {
        throw new ForbiddenException('No puedes cancelar este pedido.');
      }
      if (order.status === OrderStatus.Cancelado) {
        throw new BadRequestException('El pedido ya está cancelado.');
      }
      if (!this.clientCancellableStatuses.includes(order.status)) {
        throw new BadRequestException('Este pedido ya no puede cancelarse.');
      }

      const items = await manager.find(OrderItem, { where: { orderId: id } });
      const menuDate = order.createdAt.toISOString().slice(0, 10);
      const dishQty: Record<string, number> = {};

      for (const item of items) {
        if (item.dishId && item.type !== 'Pendiente') {
          dishQty[item.dishId] = (dishQty[item.dishId] ?? 0) + item.quantity;
        }
      }

      for (const [dishId, qty] of Object.entries(dishQty)) {
        await this.restoreMenuStockDelta(manager, dishId, qty, menuDate);
      }

      order.status = OrderStatus.Cancelado;
      await manager.save(order);

      return this.toResponse(order, items);
    });
  }

  async updatePaid(id: string, dto: UpdateOrderPaidDto): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    order.isPaid = dto.isPaid;
    await this.orderRepo.save(order);
    const items = await this.orderItemRepo.find({ where: { orderId: id } });
    return this.toResponse(order, items);
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    if (user.role !== AppRole.Admin) {
      throw new ForbiddenException('Solo el administrador puede eliminar pedidos.');
    }
    const result = await this.orderRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Pedido no encontrado');
  }
}
