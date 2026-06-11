import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  CreateReviewDto,
  ReviewResponseDto,
  AnalyticsSummaryDto,
} from './dto/analytics.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/app-role.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('reviews')
  @ApiOperation({ summary: 'Listar reseñas' })
  @ApiOkResponse({ type: [ReviewResponseDto] })
  getReviews(): Promise<ReviewResponseDto[]> {
    return this.analyticsService.getReviews();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de analytics' })
  @ApiOkResponse({ type: AnalyticsSummaryDto })
  getSummary(): Promise<AnalyticsSummaryDto> {
    return this.analyticsService.getSummary();
  }

  @Post('reviews')
  @Roles(AppRole.Cliente)
  @ApiOperation({ summary: 'Crear reseña' })
  @ApiOkResponse({ type: ReviewResponseDto })
  createReview(
    @Body() dto: CreateReviewDto,
    @Req() req: { user: JwtPayload },
  ): Promise<ReviewResponseDto> {
    return this.analyticsService.createReview(dto, req.user);
  }
}
