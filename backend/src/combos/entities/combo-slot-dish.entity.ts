import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ComboSlot } from './combo-slot.entity';
import { Dish } from '../../dishes/entities/dish.entity';

@Entity('combo_slot_dishes')
export class ComboSlotDish {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'combo_slot_id', length: 36 })
  comboSlotId: string;

  @ManyToOne(() => ComboSlot, (slot) => slot.allowedDishes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'combo_slot_id' })
  comboSlot: ComboSlot;

  @Column({ name: 'dish_id', length: 36 })
  dishId: string;

  @ManyToOne(() => Dish, (dish) => dish.comboSlotDishes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;
}
