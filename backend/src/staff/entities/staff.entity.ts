import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { StaffRole } from '../../common/enums/staff-role.enum';
import { Order } from '../../orders/entities/order.entity';

@Entity('staff')
export class Staff {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 50 })
  phone: string;

  @Column({ name: 'photo_url', type: 'text', default: '' })
  photoUrl: string;

  @Column({ type: 'enum', enum: StaffRole })
  role: StaffRole;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @OneToMany(() => Order, (order) => order.createdByStaff)
  orders: Order[];
}
