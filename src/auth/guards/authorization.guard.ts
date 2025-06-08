import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthType } from '../enums/auth-types.enum';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuardGuard } from './access-token/access-token.guard.guard';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private static readonly defaultType = AuthType.Bearer;

  private readonly authTypesMap: Record<AuthType, CanActivate | CanActivate[]> =
    {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuardGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride('authType', [
      context.getHandler(),
      context.getClass(),
    ]) ?? [AuthorizationGuard.defaultType];

    let error = new UnauthorizedException(`You're not authorized!`);

    const guards = authTypes.map((type) => this.authTypesMap[type]).flat();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        // Assign the caught error to the error variable
        error = err;
      });

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
