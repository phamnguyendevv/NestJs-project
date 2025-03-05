import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { NestMiddleware, HttpStatus, Injectable } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { SECRET } from '../config';
import { UserService } from '../user/user.service';
import { AuthRequest } from './auth-request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith('Bearer ')) {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeaders.substring(7);

    try {
      const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload & {
        id: number;
      };

      // Kiểm tra nếu token không có `id`
      if (!decoded.id) {
        throw new HttpException(
          'Invalid token payload.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Tìm user trong database
      const user = await this.userService.findById(decoded.id);
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }

      req.user = user;
      next();
    } catch (err) {
      console.log(err);
      throw new HttpException('Invalid token.', HttpStatus.UNAUTHORIZED);
    }
  }
}
