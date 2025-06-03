import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ActiveUserData } from '../interface/active-user.interface';

/* field is the key from user payload the rest is context ctx object **/

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user: ActiveUserData = request['user'];

    return field ? user?.[field] : user;
  },
);
