import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Dish } from '../../dishes/entities/dish.entity';
import { Combo } from '../../combos/entities/combo.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'order_id', length: 36 })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'dish_id', length: 36, nullable: true })
  dishId: string | null;

  @ManyToOne(() => Dish, (dish) => dish.orderItems, { nullable: true })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish | null;

  @Column({ name: 'combo_id', length: 36, nullable: true })
  comboId: string | null;

  @ManyToOne(() => Combo, (combo) => combo.orderItems, { nullable: true })
  @JoinColumn({ name: 'combo_id' })
  combo: Combo | null;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 50 })
  type: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
