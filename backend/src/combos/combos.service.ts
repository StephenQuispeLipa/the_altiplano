import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Combo } from './entities/combo.entity';
import { ComboSlot } from './entities/combo-slot.entity';
import { ComboSlotDish } from './entities/combo-slot-dish.entity';
import {
  CreateComboDto,
  UpdateComboDto,
  ComboResponseDto,
} from './dto/combo.dto';

@Injectable()
export class CombosService {
  constructor(
    @InjectRepository(Combo) private readonly comboRepo: Repository<Combo>,
    @InjectRepository(ComboSlot)
    private readonly slotRepo: Repository<ComboSlot>,
    @InjectRepository(ComboSlotDish)
    private readonly slotDishRepo: Repository<ComboSlotDish>,
  ) {}

  private toResponse(combo: Combo, slots: ComboSlot[]): ComboResponseDto {
    return {
      id: combo.id,
      name: combo.name,
      basePrice: Number(combo.basePrice),
      image: combo.imageUrl,
      slots: slots.map((slot) => ({
        id: slot.slotKey,
        label: slot.label,
        allowedDishIds:
          slot.allowedDishes?.map((d) => d.dishId) ??
          [],
      })),
    };
  }

  private async loadCombo(id: string): Promise<ComboResponseDto> {
    const combo = await this.comboRepo.findOne({ where: { id } });
    if (!combo) throw new NotFoundException('Combo no encontrado');
    const slots = await this.slotRepo.find({
      where: { comboId: id },
      relations: { allowedDishes: true },
    });
    return this.toResponse(combo, slots);
  }

  async findAll(): Promise<ComboResponseDto[]> {
    const combos = await this.comboRepo.find();
    return Promise.all(combos.map((c) => this.loadCombo(c.id)));
  }

  async findOne(id: string): Promise<ComboResponseDto> {
    return this.loadCombo(id);
  }

  async isDishReferenced(dishId: string): Promise<boolean> {
    const count = await this.slotDishRepo.count({ where: { dishId } });
    return count > 0;
  }

  private async saveSlots(comboId: string, slots: CreateComboDto['slots']) {
    await this.slotDishRepo
      .createQueryBuilder()
      .delete()
      .where(
        'combo_slot_id IN (SELECT id FROM combo_slots WHERE combo_id = :comboId)',
        { comboId },
      )
      .execute();
    await this.slotRepo.delete({ comboId });

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const slotKey = slot.id ?? `slot${i + 1}`;
      const slotId = `${comboId}_${slotKey}`;
      await this.slotRepo.save({
        id: slotId,
        comboId,
        slotKey,
        label: slot.label,
      });
      for (const dishId of slot.allowedDishIds) {
        await this.slotDishRepo.save({
          id: uuidv4(),
          comboSlotId: slotId,
          dishId,
        });
      }
    }
  }

  async create(dto: CreateComboDto): Promise<ComboResponseDto> {
    const id = `combo${uuidv4().slice(0, 6)}`;
    await this.comboRepo.save({
      id,
      name: dto.name,
      basePrice: dto.basePrice,
      imageUrl: dto.image ?? '',
    });
    await this.saveSlots(id, dto.slots);
    return this.loadCombo(id);
  }

  async update(id: string, dto: UpdateComboDto): Promise<ComboResponseDto> {
    const combo = await this.comboRepo.findOne({ where: { id } });
    if (!combo) throw new NotFoundException('Combo no encontrado');
    if (dto.name !== undefined) combo.name = dto.name;
    if (dto.basePrice !== undefined) combo.basePrice = dto.basePrice;
    if (dto.image !== undefined) combo.imageUrl = dto.image;
    await this.comboRepo.save(combo);
    if (dto.slots) await this.saveSlots(id, dto.slots);
    return this.loadCombo(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.comboRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Combo no encontrado');
  }
}
