import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
const SECRET = "NguyenDeptrai"
import { UserData, UserDecoratorOptions } from './user.interface';



export const User = createParamDecorator(
  (data: UserDecoratorOptions | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    let user: UserData | null  = null;

    // Lấy user từ middleware (nếu có)
    if (req.user) {
      user = req.user as UserData;

    } else {
      // Nếu chưa có user, kiểm tra trong JWT token
      const token = req.headers.authorization ? (req.headers.authorization as string).split(' ') : null;
      if (token && token[1]) {
        try {
          const decoded: any = jwt.verify(token[1], SECRET);
          user = decoded.user;
        } catch (err) {
          throw new ForbiddenException('Invalid token');
        }
      }
    }

    // Nếu không tìm thấy user => Không được phép truy cập
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
     // 🔥 Sửa lỗi TypeScript khi kiểm tra quyền
    if (data?.roles && data.roles.length > 0) {
      const userRoles = user.roles.split(',')
      const hasRole = userRoles.some((role: string) => data.roles?.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
    }

    // Trả về thông tin user hoặc một trường cụ thể nếu có yêu cầu (vd: 'id')
    return data?.field ? user[data.field] : user;
  }
);
