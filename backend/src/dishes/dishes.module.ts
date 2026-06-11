import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishesService } from './dishes.service';
import { DishesController } from './dishes.controller';
import { Dish } from './entities/dish.entity';
import { ComboSlotDish } from '../combos/entities/combo-slot-dish.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, ComboSlotDish, OrderItem])],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}
