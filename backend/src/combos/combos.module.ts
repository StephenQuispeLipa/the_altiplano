import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombosService } from './combos.service';
import { CombosController } from './combos.controller';
import { Combo } from './entities/combo.entity';
import { ComboSlot } from './entities/combo-slot.entity';
import { ComboSlotDish } from './entities/combo-slot-dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Combo, ComboSlot, ComboSlotDish])],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}
