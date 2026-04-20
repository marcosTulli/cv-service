import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Education,
  EducationContent,
  EducationDocument,
  EducationLocalizedContent,
} from './schemas/education.schema';
import {
  CreateEducationDto,
  EducationTranslationDto,
  EducationUrlDto,
  UpdateEducationDto,
  UpdateEducationTranslationDto,
} from './dto';

const RESERVED_KEYS = new Set(['_id', 'url']);

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education.name)
    private readonly educationModel: Model<EducationDocument>,
  ) {}

  async findByUserIdWithLang(lang: string, userId: string) {
    const userObjectId = this.toUserObjectId(userId);

    const data = await this.educationModel
      .findOne({ userId: userObjectId })
      .lean();

    if (!data) {
      throw new NotFoundException('Education content not found');
    }

    const modifiedData = data.education
      .filter((i) => {
        const localized = i[lang];
        return localized && typeof localized === 'object';
      })
      .map((i) => {
        const localized = i[lang] as EducationLocalizedContent;
        return {
          id: i._id,
          url: i.url,
          title: localized.title,
          content: localized.content,
        };
      });

    return modifiedData;
  }

  async createEducation(userId: string, dto: CreateEducationDto) {
    const userObjectId = this.toUserObjectId(userId);
    const entryId = new Types.ObjectId();
    const entry = {
      _id: entryId,
      ...(dto.url !== undefined ? { url: dto.url } : {}),
      ...(dto.translations ?? {}),
    };

    const updated = await this.educationModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        $push: { education: entry },
        $setOnInsert: { _id: new Types.ObjectId().toString() },
      },
      { new: true, upsert: true },
    );

    return this.findEntryInDoc(updated.education, entryId.toString());
  }

  async updateEducation(
    userId: string,
    educationId: string,
    dto: UpdateEducationDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);

    const setFields: Record<string, unknown> = {};
    if (dto.url !== undefined) {
      setFields['education.$.url'] = dto.url;
    }
    if (dto.translations) {
      for (const [lang, value] of Object.entries(dto.translations)) {
        setFields[`education.$.${lang}`] = value;
      }
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const educationObjectId = new Types.ObjectId(educationId);

    const updated = await this.educationModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'education._id': educationObjectId,
      },
      { $set: setFields },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Education entry not found');
    }

    return this.findEntryInDoc(updated.education, educationId);
  }

  async deleteEducation(userId: string, educationId: string) {
    const userObjectId = this.toUserObjectId(userId);
    const educationObjectId = new Types.ObjectId(educationId);

    const updated = await this.educationModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'education._id': educationObjectId,
      },
      { $pull: { education: { _id: educationObjectId } } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Education entry not found');
    }

    return { success: true };
  }

  async createUrl(
    userId: string,
    educationId: string,
    dto: EducationUrlDto,
  ) {
    return this.setEntryField(
      userId,
      educationId,
      'url',
      dto.url,
      'create',
    );
  }

  async updateUrl(
    userId: string,
    educationId: string,
    dto: EducationUrlDto,
  ) {
    return this.setEntryField(
      userId,
      educationId,
      'url',
      dto.url,
      'update',
    );
  }

  async deleteUrl(userId: string, educationId: string) {
    return this.unsetEntryField(userId, educationId, 'url');
  }

  async createTranslation(
    userId: string,
    educationId: string,
    lang: string,
    dto: EducationTranslationDto,
  ) {
    this.assertLang(lang);
    const entry = await this.getEntryOrThrow(userId, educationId);

    if (this.isLocalizedSet(entry[lang])) {
      throw new ConflictException(`Translation '${lang}' already set`);
    }

    return this.writeEntryField(userId, educationId, lang, {
      title: dto.title,
      content: dto.content,
    });
  }

  async updateTranslation(
    userId: string,
    educationId: string,
    lang: string,
    dto: UpdateEducationTranslationDto,
  ) {
    this.assertLang(lang);
    const entry = await this.getEntryOrThrow(userId, educationId);
    const existing = entry[lang];

    if (!this.isLocalizedSet(existing)) {
      throw new NotFoundException(`Translation '${lang}' not set`);
    }

    const merged: EducationLocalizedContent = {
      title: dto.title ?? (existing as EducationLocalizedContent).title,
      content: dto.content ?? (existing as EducationLocalizedContent).content,
    };

    return this.writeEntryField(userId, educationId, lang, merged);
  }

  async deleteTranslation(
    userId: string,
    educationId: string,
    lang: string,
  ) {
    this.assertLang(lang);
    const entry = await this.getEntryOrThrow(userId, educationId);

    if (!this.isLocalizedSet(entry[lang])) {
      throw new NotFoundException(`Translation '${lang}' not set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const educationObjectId = new Types.ObjectId(educationId);

    const updated = await this.educationModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'education._id': educationObjectId,
      },
      { $unset: { [`education.$.${lang}`]: '' } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Education entry not found');
    }

    return { success: true };
  }

  private async setEntryField(
    userId: string,
    educationId: string,
    field: 'url',
    value: string,
    mode: 'create' | 'update',
  ) {
    const entry = await this.getEntryOrThrow(userId, educationId);
    const current = entry[field];

    if (mode === 'create' && this.isValueSet(current)) {
      throw new ConflictException(`${field} already set`);
    }

    if (mode === 'update' && !this.isValueSet(current)) {
      throw new NotFoundException(`${field} not set`);
    }

    return this.writeEntryField(userId, educationId, field, value);
  }

  private async unsetEntryField(
    userId: string,
    educationId: string,
    field: 'url',
  ) {
    const entry = await this.getEntryOrThrow(userId, educationId);

    if (!this.isValueSet(entry[field])) {
      throw new NotFoundException(`${field} not set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const educationObjectId = new Types.ObjectId(educationId);

    const updated = await this.educationModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'education._id': educationObjectId,
      },
      { $unset: { [`education.$.${field}`]: '' } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Education entry not found');
    }

    return { success: true };
  }

  private async writeEntryField(
    userId: string,
    educationId: string,
    field: string,
    value: unknown,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    const educationObjectId = new Types.ObjectId(educationId);

    const updated = await this.educationModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'education._id': educationObjectId,
      },
      { $set: { [`education.$.${field}`]: value } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Education entry not found');
    }

    return this.findEntryInDoc(updated.education, educationId);
  }

  private async getEntryOrThrow(userId: string, educationId: string) {
    const userObjectId = this.toUserObjectId(userId);
    const educationObjectId = new Types.ObjectId(educationId);

    const doc = await this.educationModel
      .findOne({
        userId: userObjectId,
        'education._id': educationObjectId,
      })
      .lean();

    if (!doc) {
      throw new NotFoundException('Education entry not found');
    }

    const entry = doc.education.find(
      (e) => e._id?.toString() === educationId,
    );
    if (!entry) {
      throw new NotFoundException('Education entry not found');
    }

    return entry;
  }

  private findEntryInDoc(entries: EducationContent[], educationId: string) {
    return entries.find((e) => e._id?.toString() === educationId);
  }

  private toUserObjectId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    return new Types.ObjectId(userId);
  }

  private assertLang(lang: string) {
    if (!lang || RESERVED_KEYS.has(lang)) {
      throw new BadRequestException(`Invalid language code: ${lang}`);
    }
  }

  private isValueSet(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.length === 0) return false;
    return true;
  }

  private isLocalizedSet(value: unknown): boolean {
    return (
      value !== undefined &&
      value !== null &&
      typeof value === 'object' &&
      'title' in (value as Record<string, unknown>)
    );
  }
}
