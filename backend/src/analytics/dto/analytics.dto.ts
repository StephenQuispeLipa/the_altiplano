import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  text: string;

  @ApiProperty({ type: [String] })
  tags: string[];
}

export class AnalyticsSummaryDto {
  @ApiProperty()
  satisfactionScore: number;

  @ApiProperty({ type: [Number] })
  microChartData: number[];
}
