import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @User() Decorator - Extract user from request
 * Usage: getUserProfile(@User() user) { ... }
 */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
