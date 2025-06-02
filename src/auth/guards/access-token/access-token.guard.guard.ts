import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/auth/config/jwt.config';

@Injectable()
export class AccessTokenGuardGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const { token } = this.extractToken(request);

      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid Token');
    }
  }

  extractToken(request: Request) {
    const [_, token] = request.headers?.authorization?.split(' ') ?? [];

    return { _, token };
  }
}
