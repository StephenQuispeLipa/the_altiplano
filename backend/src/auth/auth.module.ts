import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CaptchaService } from './captcha.service';
import { CaptchaChallenge } from './entities/captcha-challenge.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Client } from '../clients/entities/client.entity';
import { AccessLogsModule } from '../access-logs/access-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, Client, CaptchaChallenge]),
    AccessLogsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') as `${number}h`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, CaptchaService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
