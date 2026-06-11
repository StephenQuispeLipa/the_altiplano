import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Dish } from './entities/dish.entity';
import { CreateDishDto, UpdateDishDto, DishResponseDto } from './dto/dish.dto';
import { ComboSlotDish } from '../combos/entities/combo-slot-dish.entity';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
    @InjectRepository(ComboSlotDish)
    private readonly comboSlotDishRepo: Repository<ComboSlotDish>,
  ) {}

  toResponse(dish: Dish): DishResponseDto {
    return {
      id: dish.id,
      name: dish.name,
      type: dish.type,
      total_orders_history: dish.totalOrdersHistory,
      image: dish.imageUrl,
    };
  }

  async findAll(): Promise<DishResponseDto[]> {
    const dishes = await this.dishRepo.find({ order: { name: 'ASC' } });
    return dishes.map((d) => this.toResponse(d));
  }

  async findOne(id: string): Promise<DishResponseDto> {
    const dish = await this.dishRepo.findOne({ where: { id } });
    if (!dish) throw new NotFoundException('Platillo no encontrado');
    return this.toResponse(dish);
  }

  async create(dto: CreateDishDto): Promise<DishResponseDto> {
    const dish = this.dishRepo.create({
      id: `d${uuidv4().slice(0, 8)}`,
      name: dto.name,
      type: dto.type,
      imageUrl: dto.image ?? '',
      totalOrdersHistory: 0,
    });
    await this.dishRepo.save(dish);
    return this.toResponse(dish);
  }

  async update(id: string, dto: UpdateDishDto): Promise<DishResponseDto> {
    const dish = await this.dishRepo.findOne({ where: { id } });
    if (!dish) throw new NotFoundException('Platillo no encontrado');
    if (dto.name !== undefined) dish.name = dto.name;
    if (dto.type !== undefined) dish.type = dto.type;
    if (dto.image !== undefined) dish.imageUrl = dto.image;
    await this.dishRepo.save(dish);
    return this.toResponse(dish);
  }

  async remove(id: string): Promise<void> {
    const referenced = await this.comboSlotDishRepo.count({ where: { dishId: id } });
    if (referenced > 0) {
      throw new BadRequestException('El platillo está referenciado en combos');
    }
    const result = await this.dishRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Platillo no encontrado');
  }
}
