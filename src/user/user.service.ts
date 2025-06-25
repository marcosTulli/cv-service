/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.userModel.find().lean();
    return users.map((user) => {
      const { password, ...rest } = user;
      return rest as UserWithoutPassword;
    });
  }

  async findByIdWithLanguage(
    id: string,
    lang: string,
  ): Promise<UserWithoutPassword> {
    const user = await this.userModel.findById(id, { password: 0 }).lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      !Array.isArray(user.availableLanguages) ||
      !user.availableLanguages.includes(lang)
    ) {
      throw new BadRequestException(
        `Language '${lang}' is not supported by this user`,
      );
    }

    return user as UserWithoutPassword;
  }
}
