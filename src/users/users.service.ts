import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingProvider } from 'src/auth/provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { SignUpDto } from 'src/auth/dtos/sign-up.dto';
import { GoogleUser } from 'src/auth/interface/google-user.interface';
import { ProfileService } from 'src/profile/profile.service';
import { GenerateTokenProvider } from 'src/auth/provider/generate-token.provider';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly profileService: ProfileService,
    private readonly generateTokenProvider: GenerateTokenProvider,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async createUser(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    const user = await this.getUserByEmail(email);

    if (user) {
      throw new ConflictException('Email already exists.');
    }

    let newUser: User;
    try {
      const profile = await this.profileService.createProfile({});
      newUser = this.userRepository.create({
        ...signUpDto,
        password: await this.hashingProvider.hashPassword(password),
        profile: profile,
      });

      newUser = await this.userRepository.save(newUser);
    } catch {
      throw new RequestTimeoutException('Failed to create user');
    }

    try {
      const { accessToken, refreshToken } =
        await this.generateTokenProvider.generateTokens(newUser);

      return { user: newUser, accessToken, refreshToken };
    } catch {
      throw new InternalServerErrorException(
        'Failed to generate authentication tokens.',
      );
    }
  }

  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      return user;
    } catch {
      throw new RequestTimeoutException('Could not execute the query.');
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOneBy({ email });

      return user;
    } catch (error) {
      console.error('Database error:', error);
      throw new RequestTimeoutException('Could not execute the query.');
    }
  }

  async getUserByGoogleId(googleId: string) {
    try {
      const user = await this.userRepository.findOneBy({ googleId });

      return user;
    } catch {
      throw new RequestTimeoutException('Could not execute the query.');
    }
  }

  async createGoogleUser(googleUser: GoogleUser) {
    let user = await this.getUserByGoogleId(googleUser.googleId);

    if (user) {
      throw new ConflictException('Google User already Exists!');
    }

    user = await this.getUserByEmail(googleUser.email);

    if (user) {
      throw new ConflictException('Email Id already Exists!');
    }

    const profile = await this.profileService.createProfile({
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      profilePic: googleUser.profilePic,
    });

    let newUser = this.userRepository.create({
      ...googleUser,
      profile: profile,
    });

    newUser = await this.userRepository.save(newUser);

    return newUser;
  }
}
