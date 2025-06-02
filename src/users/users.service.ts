import {
  ConflictException,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { HashingProvider } from 'src/auth/provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/auth/config/jwt.config';
import { ConfigType } from '@nestjs/config';

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

  async createUser(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.getUserByEmail(email);
    let newUser;

    if (user) {
      throw new ConflictException('Email already exists');
    }

    try {
      newUser = this.userRepository.create({
        ...createUserDto,
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
}
