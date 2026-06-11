import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuEntry } from '../menu/entities/menu-entry.entity';
import { Dish } from '../dishes/entities/dish.entity';
import { Combo } from '../combos/entities/combo.entity';
import { ComboSlot } from '../combos/entities/combo-slot.entity';
import { Client } from '../clients/entities/client.entity';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      MenuEntry,
      Dish,
      Combo,
      ComboSlot,
      Client,
      Staff,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
