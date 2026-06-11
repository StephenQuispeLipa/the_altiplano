import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Client } from './entities/client.entity';
import {
  CreateClientDto,
  UpdateClientDto,
  ClientResponseDto,
} from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
  ) {}

  toResponse(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      address: client.address,
      photo: client.photoUrl,
      total_orders_history: client.totalOrdersHistory,
      email: client.email,
    };
  }

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientRepo.find({ order: { name: 'ASC' } });
    return clients.map((c) => this.toResponse(c));
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return this.toResponse(client);
  }

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    const existing = await this.clientRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('El email ya está registrado');

    const client = this.clientRepo.create({
      id: `c${uuidv4().slice(0, 8)}`,
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      address: dto.address.trim(),
      photoUrl: dto.photo?.trim() ?? '',
      totalOrdersHistory: 0,
      email: dto.email.trim(),
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    await this.clientRepo.save(client);
    return this.toResponse(client);
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    if (dto.name !== undefined) client.name = dto.name.trim();
    if (dto.phone !== undefined) {
      if (dto.phone.trim().length < 7) {
        throw new BadRequestException('El teléfono debe tener al menos 7 dígitos.');
      }
      client.phone = dto.phone.trim();
    }
    if (dto.address !== undefined) client.address = dto.address.trim();
    if (dto.photo !== undefined) client.photoUrl = dto.photo.trim();

    await this.clientRepo.save(client);
    return this.toResponse(client);
  }
}
