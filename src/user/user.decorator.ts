import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserData, UserDecoratorOptions } from './user.interface';
import { SECRET } from 'src/config';

export const User = createParamDecorator(
  (data: UserDecoratorOptions | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    let user: UserData | null = null;

    if ('user' in req) {
      user = req.user as UserData;
    } else {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = jwt.verify(token, SECRET);
          user = decoded as UserData;
        } catch (err) {
          console.log(err);
          throw new UnauthorizedException('Invalid token');
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    if (data?.roles && data.roles.length > 0) {
      const userRoles = Array.isArray(user.roles)
        ? user.roles
        : user.roles.split(',');
      const hasRole = userRoles.some((role: string) =>
        data.roles?.includes(role),
      );
      if (!hasRole) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
    }

    return data?.field ? user[data.field] : user;
  },
);
