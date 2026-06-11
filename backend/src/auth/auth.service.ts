import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Staff } from '../staff/entities/staff.entity';
import { Client } from '../clients/entities/client.entity';
import { AppRole } from '../common/enums/app-role.enum';
import { StaffRole } from '../common/enums/staff-role.enum';
import { AccessEvent } from '../common/enums/access-event.enum';
import {
  LoginDto,
  RegisterDto,
  AuthUserDto,
  LoginResponseDto,
  RegisterResponseDto,
} from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CaptchaService } from './captcha.service';
import { AccessLogService } from '../access-logs/access-log.service';
import { getClientMeta } from '../common/utils/request-meta.util';
import { evaluatePasswordStrength } from '../common/utils/password-strength.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
    private readonly accessLogService: AccessLogService,
  ) {}

  async login(dto: LoginDto, req: Request): Promise<LoginResponseDto> {
    await this.captchaService.validate(dto.captchaId, dto.captchaAnswer);

    const result =
      dto.role === AppRole.Cliente
        ? await this.loginClient(dto)
        : await this.loginStaff(dto);

    const meta = getClientMeta(req);
    await this.accessLogService.log({
      userId: result.user.id,
      userEmail: result.user.email,
      userRole: result.user.role,
      userType: dto.role === AppRole.Cliente ? 'client' : 'staff',
      event: AccessEvent.Ingreso,
      meta,
    });

    return result;
  }

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    await this.captchaService.validate(dto.captchaId, dto.captchaAnswer);

    const strength = evaluatePasswordStrength(dto.password);
    const existing = await this.clientRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El email ya está registrado.');
    }

    await this.clientRepo.save({
      id: `c${uuidv4().slice(0, 8)}`,
      name: dto.name.trim(),
      phone: dto.phone.trim(),
      address: dto.address.trim(),
      photoUrl: '',
      totalOrdersHistory: 0,
      email: dto.email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, 10),
    });

    return {
      message: 'Registro exitoso. Ya puedes iniciar sesión.',
      passwordStrength: strength,
    };
  }

  async logout(req: Request, user: JwtPayload): Promise<{ message: string }> {
    const meta = getClientMeta(req);
    let email = user.email;

    if (user.userType === 'client') {
      const client = await this.clientRepo.findOne({ where: { id: user.sub } });
      if (client) {
        email = client.email;
      }
    } else {
      const staff = await this.staffRepo.findOne({ where: { id: user.sub } });
      if (staff) {
        email = staff.email;
      }
    }

    await this.accessLogService.log({
      userId: user.sub,
      userEmail: email,
      userRole: user.role,
      userType: user.userType,
      event: AccessEvent.Salida,
      meta,
    });

    return { message: 'Sesión cerrada' };
  }

  private async loginStaff(dto: LoginDto): Promise<LoginResponseDto> {
    const staff = await this.staffRepo.findOne({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!staff) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const expectedRole =
      dto.role === AppRole.Admin ? StaffRole.Admin : StaffRole.Camarero;
    if (staff.role !== expectedRole) {
      throw new UnauthorizedException('Rol no coincide con las credenciales');
    }

    const user: AuthUserDto = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      photo: staff.photoUrl,
      role: staff.role as unknown as AppRole,
    };

    const payload: JwtPayload = {
      sub: staff.id,
      email: staff.email,
      role: staff.role as unknown as AppRole,
      userType: 'staff',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  private async loginClient(dto: LoginDto): Promise<LoginResponseDto> {
    const client = await this.clientRepo.findOne({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (!client) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, client.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const user: AuthUserDto = {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      photo: client.photoUrl,
      role: AppRole.Cliente,
    };

    const payload: JwtPayload = {
      sub: client.id,
      email: client.email,
      role: AppRole.Cliente,
      userType: 'client',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async getMe(payload: JwtPayload): Promise<AuthUserDto> {
    if (payload.userType === 'client') {
      const client = await this.clientRepo.findOne({ where: { id: payload.sub } });
      if (!client) throw new UnauthorizedException();
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        photo: client.photoUrl,
        role: AppRole.Cliente,
      };
    }

    const staff = await this.staffRepo.findOne({ where: { id: payload.sub } });
    if (!staff) throw new UnauthorizedException();
    return {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      photo: staff.photoUrl,
      role: staff.role as unknown as AppRole,
    };
  }
}
