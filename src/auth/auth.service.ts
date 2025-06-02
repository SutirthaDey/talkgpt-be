import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dtos/sign-in.dto';
import { HashingProvider } from './provider/hashing.provider';
import { GenerateTokenProvider } from './provider/generate-token.provider';
import { GoogleTokenDto } from './dtos/google-token.dto';
import { GoogleAuthenticationProvider } from './provider/google-authentication.provider';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly googleAuthenticationProvider: GoogleAuthenticationProvider,
  ) {}

  async signIn(signInDto: SignInDto) {
    const user = await this.userService.getUserByEmail(signInDto.email);

    if (!user) {
      throw new BadRequestException('Invalid Email provided.');
    }

    const isValidPassword = await this.hashingProvider.compare(
      signInDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new BadRequestException(
        'Invalid Password Provided. Please check again.',
      );
    }

    const tokens = await this.generateTokenProvider.generateTokens(user);

    return tokens;
  }

  async signUp(signUpDto: SignInDto) {
    return await this.userService.createUser(signUpDto);
  }

  async authenticateViaGoogle(googleTokenDto: GoogleTokenDto) {
    return await this.googleAuthenticationProvider.authenticate(googleTokenDto);
  }
}
