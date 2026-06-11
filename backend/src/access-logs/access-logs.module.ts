import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLog } from './entities/access-log.entity';
import { AccessLogService } from './access-log.service';
import { AccessLogsController } from './access-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog])],
  controllers: [AccessLogsController],
  providers: [AccessLogService],
  exports: [AccessLogService],
})
export class AccessLogsModule {}
