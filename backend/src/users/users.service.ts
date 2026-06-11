import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Staff } from '../staff/entities/staff.entity';
import { StaffRole } from '../common/enums/staff-role.enum';
import {
  CreateStaffUserDto,
  UpdateStaffUserDto,
  StaffUserResponseDto,
} from './dto/staff-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
  ) {}

  toResponse(staff: Staff): StaffUserResponseDto {
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      photo: staff.photoUrl,
      role: staff.role,
    };
  }

  async findAllStaff(): Promise<StaffUserResponseDto[]> {
    const staff = await this.staffRepo.find({ order: { name: 'ASC' } });
    return staff.map((s) => this.toResponse(s));
  }

  async createStaff(dto: CreateStaffUserDto): Promise<StaffUserResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.staffRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('El email ya está registrado.');

    const staff = this.staffRepo.create({
      id: `${dto.role === StaffRole.Admin ? 'a' : 'e'}${uuidv4().slice(0, 6)}`,
      name: dto.name.trim(),
      email,
      phone: dto.phone.trim(),
      photoUrl: '',
      role: dto.role,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    await this.staffRepo.save(staff);
    return this.toResponse(staff);
  }

  async updateStaff(
    id: string,
    dto: UpdateStaffUserDto,
  ): Promise<StaffUserResponseDto> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Usuario no encontrado.');

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.staffRepo.findOne({ where: { email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('El email ya está en uso.');
      }
      staff.email = email;
    }

    if (dto.name !== undefined) staff.name = dto.name.trim();
    if (dto.phone !== undefined) staff.phone = dto.phone.trim();
    if (dto.role !== undefined) staff.role = dto.role;
    if (dto.password) {
      staff.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await this.staffRepo.save(staff);
    return this.toResponse(staff);
  }

  async removeStaff(id: string): Promise<void> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Usuario no encontrado.');

    if (staff.role === StaffRole.Admin) {
      const adminCount = await this.staffRepo.count({
        where: { role: StaffRole.Admin },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('No se puede eliminar el único administrador.');
      }
    }

    await this.staffRepo.delete(id);
  }
}
