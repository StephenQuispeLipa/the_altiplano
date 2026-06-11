import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessEvent } from '../../common/enums/access-event.enum';
import { AppRole } from '../../common/enums/app-role.enum';

export class AccessLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty({ enum: AppRole })
  userRole: AppRole;

  @ApiProperty()
  userType: string;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  browser: string;

  @ApiProperty({ enum: AccessEvent })
  event: AccessEvent;

  @ApiProperty()
  createdAt: string;
}

export class AccessLogListResponseDto {
  @ApiProperty({ type: [AccessLogResponseDto] })
  items: AccessLogResponseDto[];

  @ApiProperty()
  total: number;
}
