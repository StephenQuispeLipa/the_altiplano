import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { AppRole } from '../../common/enums/app-role.enum';
import { AccessEvent } from '../../common/enums/access-event.enum';

@Entity('access_logs')
export class AccessLog {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ name: 'user_id', length: 36 })
  @Index()
  userId: string;

  @Column({ name: 'user_email', length: 255 })
  userEmail: string;

  @Column({ name: 'user_role', type: 'enum', enum: AppRole })
  userRole: AppRole;

  @Column({ name: 'user_type', length: 20 })
  userType: 'staff' | 'client';

  @Column({ name: 'ip_address', length: 100 })
  ipAddress: string;

  @Column({ length: 255 })
  browser: string;

  @Column({ name: 'user_agent', type: 'text', default: '' })
  userAgent: string;

  @Column({ type: 'enum', enum: AccessEvent })
  @Index()
  event: AccessEvent;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
