/* eslint-disable @typescript-eslint/no-unused-vars */
// user.service.ts

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  InfoLocalized,
  LanguageInfo,
  User,
  UserDocument,
} from './schemas/user.schema';
import {
  CreateInfoLocalizedDto,
  LanguageInfoInputDto,
  NetworkLinkInputDto,
  UpdateInfoLocalizedDto,
  UpdateLanguageInfoDto,
  UpdateNetworkLinkDto,
  UserResponse,
  UsersResponse,
} from './dto';

export type LocalizedUser = Omit<User, 'password' | 'info'> & {
  info: InfoLocalized;
};

const NETWORK_KEYS = ['linkedin', 'github'] as const;
type NetworkKey = (typeof NETWORK_KEYS)[number];

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll(): Promise<UsersResponse[]> {
    const users = await this.userModel.find().lean();

    return users.map(({ password, _id, ...rest }) => ({
      _id: _id?.toString() ?? '',
      ...rest,
    }));
  }

  async findByIdWithLanguage(id: string, lang: string): Promise<UserResponse> {
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

    const { _id, info, ...rest } = user;

    return {
      _id: _id?.toString() ?? '',
      info: localizedInfo,
      ...rest,
    };
  }

  async createInfoLocalized(
    userId: string,
    lang: string,
    dto: CreateInfoLocalizedDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    this.assertLang(lang);

    const existing = await this.getUserOrThrow(userObjectId);
    if (this.getInfoEntry(existing, lang)) {
      throw new ConflictException(`Info for '${lang}' already set`);
    }

    const languages: LanguageInfo[] = (dto.languages ?? []).map((l) => ({
      ...l,
    }));

    const newEntry: InfoLocalized = {
      candidateTitle: dto.candidateTitle,
      about: dto.about,
      languages,
    };

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      {
        $set: { [`info.${lang}`]: newEntry },
        $addToSet: { availableLanguages: lang },
      },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return this.getInfoEntry(updated.toObject(), lang);
  }

  async updateInfoLocalized(
    userId: string,
    lang: string,
    dto: UpdateInfoLocalizedDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    this.assertLang(lang);

    const existing = await this.getUserOrThrow(userObjectId);
    if (!this.getInfoEntry(existing, lang)) {
      throw new NotFoundException(`Info for '${lang}' not set`);
    }

    const setFields: Record<string, unknown> = {};
    if (dto.candidateTitle !== undefined) {
      setFields[`info.${lang}.candidateTitle`] = dto.candidateTitle;
    }
    if (dto.about !== undefined) {
      setFields[`info.${lang}.about`] = dto.about;
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $set: setFields },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return this.getInfoEntry(updated.toObject(), lang);
  }

  async deleteInfoLocalized(userId: string, lang: string) {
    const userObjectId = this.toUserObjectId(userId);
    this.assertLang(lang);

    const existing = await this.getUserOrThrow(userObjectId);
    if (!this.getInfoEntry(existing, lang)) {
      throw new NotFoundException(`Info for '${lang}' not set`);
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      {
        $unset: { [`info.${lang}`]: '' },
        $pull: { availableLanguages: lang },
      },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }

  async createLanguageInfo(
    userId: string,
    lang: string,
    dto: LanguageInfoInputDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    this.assertLang(lang);

    const existing = await this.getUserOrThrow(userObjectId);
    const info = this.getInfoEntry(existing, lang);
    if (!info) {
      throw new NotFoundException(`Info for '${lang}' not set`);
    }

    if (info.languages?.some((l) => l.language === dto.language)) {
      throw new ConflictException(
        `Language '${dto.language}' already exists for '${lang}'`,
      );
    }

    const newLang = {
      _id: new Types.ObjectId(),
      language: dto.language,
      level: dto.level,
      flag: dto.flag,
    };

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $push: { [`info.${lang}.languages`]: newLang } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    const refreshed = this.getInfoEntry(updated.toObject(), lang);
    return refreshed?.languages?.find((l) => l.language === dto.language);
  }

  async updateLanguageInfo(
    userId: string,
    lang: string,
    language: string,
    dto: UpdateLanguageInfoDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    this.assertLang(lang);

    const existing = await this.getUserOrThrow(userObjectId);
    const info = this.getInfoEntry(existing, lang);
    if (!info) {
      throw new NotFoundException(`Info for '${lang}' not set`);
    }
    if (!info.languages?.some((l) => l.language === language)) {
      throw new NotFoundException(
        `Language '${language}' not found in '${lang}'`,
      );
    }

    const setFields: Record<string, unknown> = {};
    if (dto.language !== undefined) {
      setFields[`info.${lang}.languages.$[lang].language`] = dto.language;
    }
    if (dto.level !== undefined) {
      setFields[`info.${lang}.languages.$[lang].level`] = dto.level;
    }
    if (dto.flag !== undefined) {
      setFields[`info.${lang}.languages.$[lang].flag`] = dto.flag;
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $set: setFields },
      {
        new: true,
        arrayFilters: [{ 'lang.language': language }],
      },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    const refreshed = this.getInfoEntry(updated.toObject(), lang);
    const lookupKey = dto.language ?? language;
    return refreshed?.languages?.find((l) => l.language === lookupKey);
  }

  async deleteLanguageInfo(userId: string, lang: string, language: string) {
    const userObjectId = this.toUserObjectId(userId);
    this.assertLang(lang);

    const existing = await this.getUserOrThrow(userObjectId);
    const info = this.getInfoEntry(existing, lang);
    if (!info) {
      throw new NotFoundException(`Info for '${lang}' not set`);
    }
    if (!info.languages?.some((l) => l.language === language)) {
      throw new NotFoundException(
        `Language '${language}' not found in '${lang}'`,
      );
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $pull: { [`info.${lang}.languages`]: { language } } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }

  async createNetworkLink(
    userId: string,
    name: string,
    dto: NetworkLinkInputDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    const key = this.assertNetworkKey(name);

    const existing = await this.getUserOrThrow(userObjectId);
    if (this.isNetworkLinkSet(existing.network?.[key])) {
      throw new ConflictException(`Network '${key}' already set`);
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $set: { [`network.${key}`]: { display: dto.display, url: dto.url } } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated.toObject().network?.[key];
  }

  async updateNetworkLink(
    userId: string,
    name: string,
    dto: UpdateNetworkLinkDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    const key = this.assertNetworkKey(name);

    const existing = await this.getUserOrThrow(userObjectId);
    if (!this.isNetworkLinkSet(existing.network?.[key])) {
      throw new NotFoundException(`Network '${key}' not set`);
    }

    const setFields: Record<string, unknown> = {};
    if (dto.display !== undefined) {
      setFields[`network.${key}.display`] = dto.display;
    }
    if (dto.url !== undefined) {
      setFields[`network.${key}.url`] = dto.url;
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $set: setFields },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated.toObject().network?.[key];
  }

  async deleteNetworkLink(userId: string, name: string) {
    const userObjectId = this.toUserObjectId(userId);
    const key = this.assertNetworkKey(name);

    const existing = await this.getUserOrThrow(userObjectId);
    if (!this.isNetworkLinkSet(existing.network?.[key])) {
      throw new NotFoundException(`Network '${key}' not set`);
    }

    const updated = await this.userModel.findOneAndUpdate(
      { _id: userObjectId },
      { $unset: { [`network.${key}`]: '' } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return { success: true };
  }

  private async getUserOrThrow(userObjectId: Types.ObjectId) {
    const user = await this.userModel
      .findById(userObjectId, { password: 0 })
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private getInfoEntry(
    user: { info?: Record<string, InfoLocalized> | Map<string, InfoLocalized> },
    lang: string,
  ): InfoLocalized | undefined {
    const info = user.info;
    if (!info) return undefined;
    if (info instanceof Map) {
      return info.get(lang);
    }
    return (info as Record<string, InfoLocalized>)[lang];
  }

  private isNetworkLinkSet(link: unknown): boolean {
    return (
      link !== undefined &&
      link !== null &&
      typeof link === 'object' &&
      'url' in (link as Record<string, unknown>)
    );
  }

  private toUserObjectId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    return new Types.ObjectId(userId);
  }

  private assertLang(lang: string) {
    if (!lang || typeof lang !== 'string') {
      throw new BadRequestException('Invalid language code');
    }
  }

  private assertNetworkKey(name: string): NetworkKey {
    if (!NETWORK_KEYS.includes(name as NetworkKey)) {
      throw new BadRequestException(
        `Invalid network name. Allowed: ${NETWORK_KEYS.join(', ')}`,
      );
    }
    return name as NetworkKey;
  }
}
