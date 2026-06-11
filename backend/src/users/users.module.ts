import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
