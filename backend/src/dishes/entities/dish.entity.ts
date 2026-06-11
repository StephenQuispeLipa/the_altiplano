import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { DishType } from '../../common/enums/dish-type.enum';
import { MenuEntry } from '../../menu/entities/menu-entry.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ComboSlotDish } from '../../combos/entities/combo-slot-dish.entity';

@Entity('dishes')
export class Dish {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: DishType })
  type: DishType;

  @Column({ name: 'image_url', type: 'text', default: '' })
  imageUrl: string;

  @Column({ name: 'total_orders_history', type: 'int', default: 0 })
  totalOrdersHistory: number;

  @OneToMany(() => MenuEntry, (entry) => entry.dish)
  menuEntries: MenuEntry[];

  @OneToMany(() => OrderItem, (item) => item.dish)
  orderItems: OrderItem[];

  @OneToMany(() => ComboSlotDish, (csd) => csd.dish)
  comboSlotDishes: ComboSlotDish[];
}
