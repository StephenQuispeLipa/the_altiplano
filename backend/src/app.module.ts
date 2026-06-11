import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { appConfigModule, getDatabaseConfig } from './config/database.config';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { DishesModule } from './dishes/dishes.module';
import { MenuModule } from './menu/menu.module';
import { CombosModule } from './combos/combos.module';
import { ClientsModule } from './clients/clients.module';
import { StaffModule } from './staff/staff.module';
import { OrdersModule } from './orders/orders.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DatabaseModule } from './database/database.module';
import { AccessLogsModule } from './access-logs/access-logs.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    appConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    DatabaseModule,
    AuthModule,
    DishesModule,
    MenuModule,
    CombosModule,
    ClientsModule,
    StaffModule,
    OrdersModule,
    AnalyticsModule,
    AccessLogsModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
