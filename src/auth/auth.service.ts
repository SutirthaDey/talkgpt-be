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

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
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

    const tokens = await this.generateTokenProvider.generateTokens({
      id: user.id,
      email: user.email,
    });

    return tokens;
  }
}
