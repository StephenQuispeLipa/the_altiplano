import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Combo } from './combo.entity';
import { ComboSlotDish } from './combo-slot-dish.entity';

@Entity('combo_slots')
export class ComboSlot {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'combo_id', length: 36 })
  comboId: string;

  @ManyToOne(() => Combo, (combo) => combo.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'combo_id' })
  combo: Combo;

  @Column({ name: 'slot_key', length: 100 })
  slotKey: string;

  @Column({ length: 255 })
  label: string;

  @OneToMany(() => ComboSlotDish, (csd) => csd.comboSlot, { cascade: true })
  allowedDishes: ComboSlotDish[];
}
