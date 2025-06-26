import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Education,
  EducationDocument,
  EducationLocalizedContent,
} from './schemas/education.schema';

@Injectable()
export class EducationService {
  constructor(
    @InjectModel(Education.name)
    private readonly educationModel: Model<EducationDocument>,
  ) {}

  async findByUserIdWithLang(lang: string, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const data = await this.educationModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!data) {
      throw new NotFoundException('Education content not found');
    }

    const modifiedData = data.education.map((i) => {
      const localized = i[lang] as EducationLocalizedContent;

      if (!localized || typeof localized !== 'object') {
        throw new NotFoundException(
          `Education content not found in language: ${lang}`,
        );
      }

      return {
        id: i._id,
        url: i.url,
        title: localized.title,
        content: localized.content,
      };
    });

    return modifiedData;
  }
}
