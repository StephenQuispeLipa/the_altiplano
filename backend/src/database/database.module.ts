import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseSeedService } from './database-seed.service';
import { Dish } from '../dishes/entities/dish.entity';
import { MenuEntry } from '../menu/entities/menu-entry.entity';
import { Combo } from '../combos/entities/combo.entity';
import { ComboSlot } from '../combos/entities/combo-slot.entity';
import { ComboSlotDish } from '../combos/entities/combo-slot-dish.entity';
import { Client } from '../clients/entities/client.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Review } from '../analytics/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dish,
      MenuEntry,
      Combo,
      ComboSlot,
      ComboSlotDish,
      Client,
      Staff,
      Order,
      OrderItem,
      Review,
    ]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseModule {}
