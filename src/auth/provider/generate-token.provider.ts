import { Inject, Injectable } from '@nestjs/common';
import { ActiveUserData } from '../interface/active-user.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { User } from 'src/users/user.entity';

@Injectable()
export class GenerateTokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  signToken<T>(id: number, expiresIn: number, payload?: T) {
    return this.jwtService.signAsync(
      {
        sub: id,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: expiresIn,
      },
    );
  }

  async generateTokens(user: User) {
    // This will take the user input
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.jwtTtl,
        {
          email: user.email,
        },
      ),
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.refreshTtl,
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
