import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Dish } from '../dishes/entities/dish.entity';
import { MenuEntry } from '../menu/entities/menu-entry.entity';
import { Combo } from '../combos/entities/combo.entity';
import { ComboSlot } from '../combos/entities/combo-slot.entity';
import { ComboSlotDish } from '../combos/entities/combo-slot-dish.entity';
import { Client } from '../clients/entities/client.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Review } from '../analytics/entities/review.entity';
import { DishType } from '../common/enums/dish-type.enum';
import { StaffRole } from '../common/enums/staff-role.enum';
import { OrderStatus } from '../common/enums/order-status.enum';

const DEMO_PASSWORD = 'password123';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(Dish) private readonly dishRepo: Repository<Dish>,
    @InjectRepository(MenuEntry)
    private readonly menuRepo: Repository<MenuEntry>,
    @InjectRepository(Combo) private readonly comboRepo: Repository<Combo>,
    @InjectRepository(ComboSlot)
    private readonly comboSlotRepo: Repository<ComboSlot>,
    @InjectRepository(ComboSlotDish)
    private readonly comboSlotDishRepo: Repository<ComboSlotDish>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
  ) {}

  async onModuleInit() {
    const dishCount = await this.dishRepo.count();
    if (dishCount > 0) {
      this.logger.log('Database already seeded, skipping.');
      return;
    }
    this.logger.log('Seeding database...');
    await this.seed();
    this.logger.log('Database seeded successfully.');
  }

  private async seed() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const dishes: Partial<Dish>[] = [
      { id: 'd1', name: 'Salteñas de Carne', type: DishType.Entrada, imageUrl: '', totalOrdersHistory: 150 },
      { id: 'd9', name: 'Anticuchos', type: DishType.Entrada, imageUrl: '', totalOrdersHistory: 75 },
      { id: 'd2', name: 'Sopa de Maní', type: DishType.Sopa, imageUrl: '', totalOrdersHistory: 430 },
      { id: 'd3', name: 'Chairo Paceño', type: DishType.Sopa, imageUrl: '', totalOrdersHistory: 310 },
      { id: 'd4', name: 'Pique Macho', type: DishType.Segundo, imageUrl: '', totalOrdersHistory: 580 },
      { id: 'd10', name: 'Silpancho Cochalo', type: DishType.Segundo, imageUrl: '', totalOrdersHistory: 470 },
      { id: 'd11', name: 'Majadito Cruceño', type: DishType.Segundo, imageUrl: '', totalOrdersHistory: 295 },
      { id: 'd12', name: 'Sajta de Pollo', type: DishType.Segundo, imageUrl: '', totalOrdersHistory: 240 },
      { id: 'd13', name: 'Mocochinchi', type: DishType.Bebida, imageUrl: '', totalOrdersHistory: 980 },
      { id: 'd14', name: 'Singani Sour', type: DishType.Bebida, imageUrl: '', totalOrdersHistory: 195 },
      { id: 'd7', name: 'Gelatina con Crema', type: DishType.Postre, imageUrl: '', totalOrdersHistory: 400 },
      { id: 'd8', name: 'Flan de Leche', type: DishType.Postre, imageUrl: '', totalOrdersHistory: 195 },
    ];
    await this.dishRepo.save(dishes);

    const today = new Date().toISOString().slice(0, 10);
    const menuSeed = [
      { dishId: 'd1', price: 15, stock: 20 },
      { dishId: 'd9', price: 25, stock: 12 },
      { dishId: 'd2', price: 6, stock: 15 },
      { dishId: 'd3', price: 5, stock: 0 },
      { dishId: 'd4', price: 75, stock: 30 },
      { dishId: 'd10', price: 50, stock: 25 },
      { dishId: 'd11', price: 55, stock: 15 },
      { dishId: 'd12', price: 60, stock: 20 },
      { dishId: 'd13', price: 12, stock: 50 },
      { dishId: 'd14', price: 45, stock: 30 },
      { dishId: 'd7', price: 8, stock: 25 },
      { dishId: 'd8', price: 10, stock: 0 },
    ];
    await this.menuRepo.save(
      menuSeed.map((item, i) => ({
        id: `me${i + 1}`,
        menuDate: today,
        dishId: item.dishId,
        price: item.price,
        stock: item.stock,
        soldToday: 0,
      })),
    );

    const combosData = [
      {
        id: 'combo1',
        name: 'Almuerzo Completo',
        basePrice: 13,
        imageUrl: 'https://i.pinimg.com/736x/71/38/f5/7138f594579a706bab8b17184f591d8b.jpg',
        slots: [
          { slotKey: 'sopa', label: 'Sopa', allowedDishIds: ['d2', 'd3'] },
          { slotKey: 'segundo', label: 'Segundo', allowedDishIds: ['d4', 'd10', 'd11', 'd12'] },
        ],
      },
      {
        id: 'combo2',
        name: 'Doble Platillo',
        basePrice: 18,
        imageUrl: '',
        slots: [
          { slotKey: 'platillo1', label: 'Platillo 1', allowedDishIds: ['d4', 'd10', 'd11', 'd12'] },
          { slotKey: 'platillo2', label: 'Platillo 2', allowedDishIds: ['d4', 'd10', 'd11', 'd12'] },
        ],
      },
      {
        id: 'combo3',
        name: 'Solo Sopa',
        basePrice: 6,
        imageUrl: '',
        slots: [{ slotKey: 'sopa', label: 'Sopa', allowedDishIds: ['d2', 'd3'] }],
      },
    ];

    for (const comboData of combosData) {
      await this.comboRepo.save({
        id: comboData.id,
        name: comboData.name,
        basePrice: comboData.basePrice,
        imageUrl: comboData.imageUrl,
      });
      for (const slot of comboData.slots) {
        const slotId = `${comboData.id}_${slot.slotKey}`;
        await this.comboSlotRepo.save({
          id: slotId,
          comboId: comboData.id,
          slotKey: slot.slotKey,
          label: slot.label,
        });
        for (const dishId of slot.allowedDishIds) {
          await this.comboSlotDishRepo.save({
            id: uuidv4(),
            comboSlotId: slotId,
            dishId,
          });
        }
      }
    }

    await this.clientRepo.save([
      {
        id: 'c1',
        name: 'Carlos Perez',
        phone: '77712345',
        address: 'Av. Arce 2045, Oficina 201, La Paz',
        photoUrl: '',
        totalOrdersHistory: 15,
        email: 'carlos@cliente.com',
        passwordHash,
      },
      {
        id: 'c2',
        name: 'Maria Gomez',
        phone: '76123456',
        address: 'Calle Linares 890, Zona Central',
        photoUrl: '',
        totalOrdersHistory: 8,
        email: 'maria@cliente.com',
        passwordHash,
      },
      {
        id: 'c3',
        name: 'Juan Torres',
        phone: '71234567',
        address: 'Al frente del kiosko, Calle 12',
        photoUrl: '',
        totalOrdersHistory: 42,
        email: 'juan@cliente.com',
        passwordHash,
      },
      {
        id: 'c4',
        name: 'Ana Rios',
        phone: '79876543',
        address: 'Zona Sur, La Paz',
        photoUrl: '',
        totalOrdersHistory: 5,
        email: 'ana@cliente.com',
        passwordHash,
      },
    ]);

    await this.staffRepo.save([
      {
        id: 'a1',
        name: 'Juan Díaz',
        email: 'admin@altiplanofamiliar.com',
        phone: '70123456',
        photoUrl: '',
        role: StaffRole.Admin,
        passwordHash,
      },
      {
        id: 'e1',
        name: 'Juan Díaz',
        email: 'camarero@altiplanofamiliar.com',
        phone: '78901234',
        photoUrl: '',
        role: StaffRole.Camarero,
        passwordHash,
      },
    ]);

    await this.reviewRepo.save([
      {
        id: uuidv4(),
        author: 'Elena Vargas',
        rating: 5,
        text: 'La Salteña es sencillamente increíble. Me recordó a las que mi abuela hacía en Sucre.',
        tags: ['Salteña', 'Sucre Tradicional'],
      },
      {
        id: uuidv4(),
        author: 'Marco Ruiz',
        rating: 4,
        text: 'Excelente servicio, aunque el Pique Macho estaba un poco más picante de lo habitual.',
        tags: ['Pique Macho', 'Servicio'],
      },
      {
        id: uuidv4(),
        author: 'Carla Mendez',
        rating: 5,
        text: 'El Majadito de pato es el mejor que he probado en La Paz. ¡Volveremos!',
        tags: ['Majadito', 'Gourmet'],
      },
    ]);

    const sampleOrders = [
      {
        id: 'o3294',
        clientId: 'c1',
        createdByStaffId: 'e1',
        createdByName: 'Juan',
        total: 21,
        status: OrderStatus.EnPreparacion,
        isPaid: true,
        isTakeaway: true,
        location: 'Mesa 4',
        items: [
          { name: 'Salteñas de Carne', price: 15, type: 'Entrada', dishId: 'd1', quantity: 1 },
          { name: 'Sopa de Maní', price: 6, type: 'Sopa', dishId: 'd2', quantity: 1 },
        ],
      },
      {
        id: 'o3293',
        clientId: 'c3',
        createdByStaffId: 'e1',
        createdByName: 'Carlos',
        total: 75,
        status: OrderStatus.EnPreparacion,
        isPaid: false,
        isTakeaway: true,
        location: 'Delivery',
        items: [{ name: 'Pique Macho', price: 75, type: 'Segundo', dishId: 'd4', quantity: 1 }],
      },
    ];

    for (const orderData of sampleOrders) {
      const { items, ...orderFields } = orderData;
      await this.orderRepo.save({
        ...orderFields,
        createdAt: new Date(),
      });
      for (const item of items) {
        await this.orderItemRepo.save({
          id: uuidv4(),
          orderId: orderData.id,
          dishId: item.dishId,
          comboId: null,
          name: item.name,
          price: item.price,
          type: item.type,
          quantity: item.quantity,
        });
      }
    }
  }
}
