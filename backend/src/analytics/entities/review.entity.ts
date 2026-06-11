import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('reviews')
export class Review {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'client_id', length: 36, nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, (client) => client.reviews, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client | null;

  @Column({ length: 255 })
  author: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
