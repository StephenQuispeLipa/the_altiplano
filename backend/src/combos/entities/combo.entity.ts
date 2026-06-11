import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ComboSlot } from './combo-slot.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('combos')
export class Combo {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'base_price', type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ name: 'image_url', type: 'text', default: '' })
  imageUrl: string;

  @OneToMany(() => ComboSlot, (slot) => slot.combo, { cascade: true })
  slots: ComboSlot[];

  @OneToMany(() => OrderItem, (item) => item.combo)
  orderItems: OrderItem[];
}
