import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InfoLocalized, User, UserDocument } from './schemas/user.schema';

type UserWithoutPassword = Omit<User, 'password'>;

export type LocalizedUser = Omit<User, 'password' | 'info'> & {
  info: InfoLocalized;
};

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<UserWithoutPassword[]> {
    const users = await this.userModel.find().lean();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return users.map(({ password, ...rest }) => rest as UserWithoutPassword);
  }

  async findByIdWithLanguage(id: string, lang: string): Promise<LocalizedUser> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }

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

    const localizedInfo = user.info?.[lang];
    if (!localizedInfo) {
      throw new NotFoundException(`Localized info for '${lang}' not found`);
    }

    return {
      ...user,
      info: localizedInfo,
    } as LocalizedUser;
  }
}
