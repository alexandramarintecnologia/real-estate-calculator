import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserRole } from '../../users/schemas/user.schema.js';

/**
 * Forma del usuario que `JwtStrategy.validate` deja en `request.user`.
 * Es la unica fuente de verdad de este tipo: los controladores lo importan
 * de aqui en vez de redeclararlo.
 */
export interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

type RequestWithUser = { user: JwtUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
