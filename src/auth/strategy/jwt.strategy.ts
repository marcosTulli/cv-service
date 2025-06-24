import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose'; // ✅ Add this
import { Model } from 'mongoose';
import { Request } from 'express';
import { User, UserDocument } from 'src/user/schemas/user.schema'; // ✅ Add User

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,

    @InjectModel(User.name) // ✅ Add this decorator
    private userModel: Model<UserDocument>,
  ) {
    const options: StrategyOptionsWithoutRequest = {
      jwtFromRequest: (req: Request) => {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          return authHeader.slice(7);
        }
        return null;
      },
      secretOrKey: config.get<string>('JWT_SECRET') ?? '',
    };

    super(options);
  }

  async validate(payload: JwtPayload): Promise<UserDocument | null> {
    const user = await this.userModel
      .findById(payload.sub, { password: 0 })
      .lean();
    return user ?? null;
  }
}
