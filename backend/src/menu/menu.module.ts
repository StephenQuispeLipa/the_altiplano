import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MenuEntry } from './entities/menu-entry.entity';
import { Dish } from '../dishes/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntry, Dish])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
