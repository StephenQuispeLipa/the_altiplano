import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    forwardRef(() => OrdersModule),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
