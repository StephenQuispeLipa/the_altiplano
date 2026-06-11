import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Dish } from '../../dishes/entities/dish.entity';

@Entity('menu_entries')
@Unique(['menuDate', 'dishId'])
export class MenuEntry {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'menu_date', type: 'date' })
  menuDate: string;

  @Column({ name: 'dish_id', length: 36 })
  dishId: string;

  @ManyToOne(() => Dish, (dish) => dish.menuEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'sold_today', type: 'int', default: 0 })
  soldToday: number;
}
