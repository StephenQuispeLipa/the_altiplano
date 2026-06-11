import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MenuEntry } from './entities/menu-entry.entity';
import { Dish } from '../dishes/entities/dish.entity';
import {
  CreateMenuEntryDto,
  UpdateMenuEntryDto,
  MenuEntryResponseDto,
} from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntry)
    private readonly menuRepo: Repository<MenuEntry>,
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
  ) {}

  private todayISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private assertToday(date: string) {
    if (date !== this.todayISO()) {
      throw new BadRequestException(
        'Solo se puede modificar el menú del día actual.',
      );
    }
  }

  async getEnrichedMenu(date: string): Promise<MenuEntryResponseDto[]> {
    const entries = await this.menuRepo.find({
      where: { menuDate: date },
      relations: { dish: true },
    });
    return entries
      .filter((e) => e.dish)
      .map((e) => ({
        id: e.id,
        dishId: e.dishId,
        price: Number(e.price),
        stock: e.stock,
        soldToday: e.soldToday,
        name: e.dish.name,
        image: e.dish.imageUrl,
        type: e.dish.type,
      }));
  }

  async addEntry(
    date: string,
    dto: CreateMenuEntryDto,
  ): Promise<MenuEntryResponseDto> {
    this.assertToday(date);
    const existing = await this.menuRepo.findOne({
      where: { menuDate: date, dishId: dto.dishId },
    });
    if (existing) {
      throw new BadRequestException('Este platillo ya está en el menú.');
    }
    const dish = await this.dishRepo.findOne({ where: { id: dto.dishId } });
    if (!dish) throw new NotFoundException('Platillo no encontrado');

    const entry = this.menuRepo.create({
      id: `me${uuidv4().slice(0, 8)}`,
      menuDate: date,
      dishId: dto.dishId,
      price: dto.price,
      stock: dto.stock,
      soldToday: 0,
    });
    await this.menuRepo.save(entry);
    return {
      id: entry.id,
      dishId: entry.dishId,
      price: Number(entry.price),
      stock: entry.stock,
      soldToday: entry.soldToday,
      name: dish.name,
      image: dish.imageUrl,
      type: dish.type,
    };
  }

  async updateEntry(
    date: string,
    entryId: string,
    dto: UpdateMenuEntryDto,
  ): Promise<MenuEntryResponseDto> {
    this.assertToday(date);
    const entry = await this.menuRepo.findOne({
      where: { id: entryId, menuDate: date },
      relations: { dish: true },
    });
    if (!entry) throw new NotFoundException('Entrada no encontrada');
    if (dto.price !== undefined) entry.price = dto.price;
    if (dto.stock !== undefined) entry.stock = dto.stock;
    await this.menuRepo.save(entry);
    return {
      id: entry.id,
      dishId: entry.dishId,
      price: Number(entry.price),
      stock: entry.stock,
      soldToday: entry.soldToday,
      name: entry.dish.name,
      image: entry.dish.imageUrl,
      type: entry.dish.type,
    };
  }

  async removeEntry(date: string, entryId: string): Promise<void> {
    this.assertToday(date);
    const result = await this.menuRepo.delete({ id: entryId, menuDate: date });
    if (result.affected === 0) throw new NotFoundException('Entrada no encontrada');
  }
}
