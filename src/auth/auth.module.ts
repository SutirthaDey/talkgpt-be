import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BcryptProvider } from './provider/bcrypt.provider';
import { HashingProvider } from './provider/hashing.provider';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { UsersModule } from 'src/users/users.module';
import { GenerateTokenProvider } from './provider/generate-token.provider';
import { GoogleAuthenticationProvider } from './provider/google-authentication.provider';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    /* Registers the custom jwt config so it can be accessed via ConfigService.get('jwt'). **/
    ConfigModule.forFeature(jwtConfig),
    /* Configures the JwtModule dynamically using values from the registered jwt config. **/
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    GenerateTokenProvider,
    GoogleAuthenticationProvider,
  ],
  exports: [HashingProvider, JwtModule, GenerateTokenProvider],
})
export class AuthModule {}
