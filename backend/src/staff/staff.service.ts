import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { UpdateStaffDto, StaffResponseDto } from './dto/staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
  ) {}

  toResponse(staff: Staff): StaffResponseDto {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      photo: staff.photoUrl,
      role: staff.role,
    };
  }

  async findOne(id: string): Promise<StaffResponseDto> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Empleado no encontrado');
    return this.toResponse(staff);
  }

  async update(id: string, dto: UpdateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Empleado no encontrado');

    if (dto.name !== undefined) staff.name = dto.name.trim();
    if (dto.email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email.trim())) {
        throw new BadRequestException('Ingresa un correo electrónico válido.');
      }
      staff.email = dto.email.trim();
    }
    if (dto.phone !== undefined) {
      if (dto.phone.trim().length < 7) {
        throw new BadRequestException('El teléfono debe tener al menos 7 dígitos.');
      }
      staff.phone = dto.phone.trim();
    }
    if (dto.photo !== undefined) staff.photoUrl = dto.photo.trim();

    await this.staffRepo.save(staff);
    return this.toResponse(staff);
  }
}
