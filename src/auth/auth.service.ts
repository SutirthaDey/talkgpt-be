import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dtos/sign-in.dto';
import { HashingProvider } from './provider/hashing.provider';
import { GenerateTokenProvider } from './provider/generate-token.provider';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { GoogleAuthenticationProvider } from './provider/google-authentication.provider';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { GenerateAccessTokenDto } from './dtos/generate-access-token';
import { ActiveUserData } from './interface/active-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly googleAuthenticationProvider: GoogleAuthenticationProvider,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.userService.getUserByEmail(signInDto.email);

    if (!user) {
      throw new BadRequestException('Invalid email provided.');
    }

    if (user.googleId) {
      throw new BadRequestException(
        'This email is registered with a Google account. Please use Google sign-in.',
      );
    }

    let isValidPassword: boolean;
    try {
      isValidPassword = await this.hashingProvider.compare(
        signInDto.password,
        user.password,
      );
    } catch {
      throw new BadRequestException(
        'An error occurred during password validation.',
      );
    }

    if (!isValidPassword) {
      throw new BadRequestException('Invalid passoword provided.');
    }

    try {
      const { accessToken, refreshToken } =
        await this.generateTokenProvider.generateTokens(user);
      return { user, accessToken, refreshToken };
    } catch {
      throw new InternalServerErrorException(
        'Failed to generate authentication tokens.',
      );
    }
  }

  async signUp(signUpDto: SignInDto) {
    return await this.userService.createUser(signUpDto);
  }

  async authenticateViaGoogle(googleTokenDto: GoogleTokenDto) {
    return await this.googleAuthenticationProvider.authenticate(googleTokenDto);
  }

  async generateAccessToken(generateAccessTokenDto: GenerateAccessTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(generateAccessTokenDto.refreshToken, this.jwtConfiguration);
      const user = await this.userService.getUserById(sub);

      const { accessToken } =
        await this.generateTokenProvider.generateTokens(user);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
