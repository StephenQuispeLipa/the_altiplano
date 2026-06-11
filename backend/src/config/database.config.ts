import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST', 'localhost'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USER', 'postgres'),
  password: configService.get<string>('DATABASE_PASSWORD', ''),
  database: configService.get<string>('DATABASE_NAME', 'the_altiplano_db'),
  autoLoadEntities: true,
  synchronize:
    configService.get<string>('DATABASE_SYNCHRONIZE') === 'true'
    || configService.get<string>('NODE_ENV') !== 'production',
  logging: configService.get<string>('NODE_ENV') === 'development',
});

export const appConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
});
