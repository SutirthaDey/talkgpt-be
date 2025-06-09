import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import environmentValidation from './config/environment.validation';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AccessTokenGuardGuard } from './auth/guards/access-token/access-token.guard.guard';
import jwtConfig from './auth/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { AuthorizationGuard } from './auth/guards/authorization.guard';
import { ProfileModule } from './profile/profile.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

const NODE_ENV = process.env.NODE_ENV ?? 'production';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    /* Registers the custom jwt config so it can be accessed via ConfigService.get('jwt'). **/
    ConfigModule.forFeature(jwtConfig),
    /* Configures the JwtModule dynamically using values from the registered jwt config. **/
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: NODE_ENV == 'production' ? '.env' : `.env.${NODE_ENV}`,
      validationSchema: environmentValidation,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: parseInt(configService.get('database.port'), 10),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          synchronize: configService.get('database.synchronize') === 'true',
          autoLoadEntities:
            configService.get('database.autoLoadEntities') === 'true',
          ssl: {
            rejectUnauthorized: false, // Needed for Supabase and other managed DBs
          },
        };
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 30,
          ttl: 60,
          blockDuration: 300,
        },
      ],
    }),
    ProfileModule,
    ChatHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    AccessTokenGuardGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
