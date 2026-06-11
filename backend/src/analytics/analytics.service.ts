import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Review } from './entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { Client } from '../clients/entities/client.entity';
import {
  CreateReviewDto,
  ReviewResponseDto,
  AnalyticsSummaryDto,
} from './dto/analytics.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
  ) {}

  private formatDate(date: Date): string {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `Hace ${hours || 1} horas`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Ayer';
    return `Hace ${days} días`;
  }

  toReviewResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      author: review.author,
      date: this.formatDate(review.createdAt),
      rating: review.rating,
      text: review.text,
      tags: review.tags ?? [],
    };
  }

  async getReviews(): Promise<ReviewResponseDto[]> {
    const reviews = await this.reviewRepo.find({
      order: { createdAt: 'DESC' },
    });
    return reviews.map((r) => this.toReviewResponse(r));
  }

  async createReview(
    dto: CreateReviewDto,
    user: JwtPayload,
  ): Promise<ReviewResponseDto> {
    const client = await this.clientRepo.findOne({ where: { id: user.sub } });
    const review = this.reviewRepo.create({
      id: uuidv4(),
      clientId: user.sub,
      author: client?.name ?? 'Cliente',
      rating: dto.rating,
      text: dto.text,
      tags: dto.tags ?? [],
    });
    await this.reviewRepo.save(review);
    return this.toReviewResponse(review);
  }

  async getSummary(): Promise<AnalyticsSummaryDto> {
    const reviews = await this.reviewRepo.find();
    const satisfactionScore =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 4.8;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const orders = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.created_at >= :since', { since: sevenDaysAgo })
      .getMany();

    const microChartData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      const dayStr = day.toISOString().slice(0, 10);
      return orders.filter(
        (o) => o.createdAt.toISOString().slice(0, 10) === dayStr,
      ).length;
    });

    const max = Math.max(...microChartData, 1);
    const normalized = microChartData.map((v) => Math.round((v / max) * 100));

    return {
      satisfactionScore: Math.round(satisfactionScore * 10) / 10,
      microChartData: normalized.length ? normalized : [40, 60, 45, 80, 100, 75, 85],
    };
  }
}
