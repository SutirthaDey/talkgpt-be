import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/sign-in.dto';
import { Auth } from './decorators/auth-type.decorator';
import { AuthType } from './enums/auth-types.enum';
import { GoogleTokenDto } from './dtos/google-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Auth(AuthType.None)
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(AuthType.None)
  @Post('sign-up')
  async createUser(@Body() signUpDto: SignInDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Auth(AuthType.None)
  @Post('google-authentication')
  async googleAuthenticate(@Body() googleTokenDto: GoogleTokenDto) {
    return await this.authService.authenticateViaGoogle(googleTokenDto);
  }
}
