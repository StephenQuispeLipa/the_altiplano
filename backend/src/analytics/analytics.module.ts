import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order, Client])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
