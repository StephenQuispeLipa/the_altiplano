import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../analytics/entities/review.entity';

@Entity('clients')
export class Client {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'photo_url', type: 'text', default: '' })
  photoUrl: string;

  @Column({ name: 'total_orders_history', type: 'int', default: 0 })
  totalOrdersHistory: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @OneToMany(() => Order, (order) => order.client)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.client)
  reviews: Review[];
}
