import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccessLog } from './entities/access-log.entity';
import { AccessEvent } from '../common/enums/access-event.enum';
import { AppRole } from '../common/enums/app-role.enum';
import { ClientMeta } from '../common/utils/request-meta.util';
import { AccessLogResponseDto } from './dto/access-log.dto';

export interface LogAccessParams {
  userId: string;
  userEmail: string;
  userRole: AppRole;
  userType: 'staff' | 'client';
  event: AccessEvent;
  meta: ClientMeta;
}

@Injectable()
export class AccessLogService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly accessLogRepo: Repository<AccessLog>,
  ) {}

  async log(params: LogAccessParams): Promise<void> {
    await this.accessLogRepo.save({
      id: uuidv4(),
      userId: params.userId,
      userEmail: params.userEmail,
      userRole: params.userRole,
      userType: params.userType,
      ipAddress: params.meta.ipAddress,
      browser: params.meta.browser,
      userAgent: params.meta.userAgent,
      event: params.event,
    });
  }

  toResponse(log: AccessLog): AccessLogResponseDto {
    return {
      id: log.id,
      userId: log.userId,
      userEmail: log.userEmail,
      userRole: log.userRole,
      userType: log.userType,
      ipAddress: log.ipAddress,
      browser: log.browser,
      event: log.event,
      createdAt: log.createdAt.toISOString(),
    };
  }

  async findAll(filters: {
    userId?: string;
    email?: string;
    event?: AccessEvent;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: AccessLogResponseDto[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<AccessLog> = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.event) where.event = filters.event;
    if (filters.email) where.userEmail = Like(`%${filters.email}%`);
    if (filters.from && filters.to) {
      where.createdAt = Between(new Date(filters.from), new Date(filters.to));
    }

    const [items, total] = await this.accessLogRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items: items.map((l) => this.toResponse(l)),
      total,
    };
  }
}
