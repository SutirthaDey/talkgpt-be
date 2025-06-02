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

const NODE_ENV = process.env.NODE_ENV ?? 'production';

@Module({
  imports: [
    AuthModule,
    UsersModule,
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
        console.log(configService.get('database.autoLoadEntities'));
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
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
