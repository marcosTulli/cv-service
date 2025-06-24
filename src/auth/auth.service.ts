import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto, SignupDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup({ dto }: { dto: SignupDto }) {
    const hash = await argon.hash(dto.password);

    const existingUser = await this.userModel
      .findOne({ email: dto.email })
      .exec();
    if (existingUser) {
      throw new ForbiddenException('Credentials taken');
    }

    const createdUser = new this.userModel({
      email: dto.email,
      name: dto.name,
      password: hash,
    });
    await createdUser.save();

    return this.signToken({
      userId: (createdUser._id as Types.ObjectId).toString(),
      email: createdUser.email,
    });
  }

  async login({ dto }: { dto: LoginDto }) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken({
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
    });
  }

  async signToken({
    userId,
    email,
  }: {
    userId: string;
    email: string;
  }): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret: string = this.config.get('JWT_SECRET') ?? '';
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });
    return { access_token: token };
  }
}
