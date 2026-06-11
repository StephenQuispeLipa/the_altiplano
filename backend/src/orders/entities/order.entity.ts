import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Client } from '../../clients/entities/client.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'client_id', length: 36, nullable: true })
  @Index()
  clientId: string | null;

  @ManyToOne(() => Client, (client) => client.orders, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client | null;

  @Column({ name: 'created_by_staff_id', length: 36, nullable: true })
  createdByStaffId: string | null;

  @ManyToOne(() => Staff, (staff) => staff.orders, { nullable: true })
  @JoinColumn({ name: 'created_by_staff_id' })
  createdByStaff: Staff | null;

  @Column({ name: 'created_by_name', length: 255 })
  createdByName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.EnPreparacion })
  @Index()
  status: OrderStatus;

  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @Column({ name: 'is_takeaway', default: false })
  isTakeaway: boolean;

  @Column({ length: 100, default: '' })
  location: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
