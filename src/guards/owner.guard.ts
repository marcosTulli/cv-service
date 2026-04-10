import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';
import { Roles } from 'src/user/schemas/user.schema';
import JwtGuard from 'src/auth/guard/jwt.guard';

interface AuthenticatedUser {
  _id?: Types.ObjectId | string;
  role?: Roles;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  params: { userId?: string; id?: string };
}

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role === Roles.ADMIN) {
      return true;
    }

    const targetUserId = req.params?.userId ?? req.params?.id;
    if (!targetUserId) {
      throw new ForbiddenException('Request is missing a userId path param');
    }

    const callerId = user._id?.toString();
    if (!callerId || callerId !== targetUserId) {
      throw new ForbiddenException('You can only modify your own data');
    }

    return true;
  }
}

export const OwnerOnly = () => applyDecorators(UseGuards(JwtGuard, OwnerGuard));
