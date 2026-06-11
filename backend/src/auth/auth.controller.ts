import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import {
  LoginDto,
  RegisterDto,
  LoginResponseDto,
  AuthUserDto,
  CaptchaResponseDto,
  RegisterResponseDto,
} from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Public()
  @Get('captcha')
  @ApiOperation({ summary: 'Obtener CAPTCHA de reconocimiento de texto' })
  @ApiOkResponse({ type: CaptchaResponseDto })
  getCaptcha(): Promise<CaptchaResponseDto> {
    return this.captchaService.generate();
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo cliente' })
  @ApiOkResponse({ type: RegisterResponseDto })
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({ type: LoginResponseDto })
  login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, req);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiOkResponse({ type: AuthUserDto })
  me(@Req() req: { user: JwtPayload }): Promise<AuthUserDto> {
    return this.authService.getMe(req.user);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión y registrar salida' })
  logout(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<{ message: string }> {
    return this.authService.logout(req, req.user);
  }
}
