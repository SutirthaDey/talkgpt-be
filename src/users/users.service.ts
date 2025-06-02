import {
  ConflictException,
  Inject,
  Injectable,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async createUser(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;

    const user = await this.getUserByEmail(email);
    let newUser;

    if (user) {
      throw new ConflictException('Email already exists.');
    }

    try {
      newUser = this.userRepository.create({
        ...signUpDto,
        password: await this.hashingProvider.hashPassword(password),
      });

      newUser = await this.userRepository.save(newUser);
    } catch {
      throw new RequestTimeoutException('Failed to create user');
    }

    return newUser;
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
    } catch {
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

    let newUser = this.userRepository.create(googleUser);

    newUser = await this.userRepository.save(newUser);

    return newUser;
  }
}
