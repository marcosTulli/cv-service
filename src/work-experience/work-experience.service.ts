import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  WorkExperienceDocument,
  WorkExperience,
} from './schemas/work-experience.schema';

@Injectable()
export class WorkExperienceService {
  constructor(
    @InjectModel(WorkExperience.name)
    private readonly workExperienceModel: Model<WorkExperienceDocument>,
  ) {}

  async findByUserIdWithLang(lang: string, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const data = await this.workExperienceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!data) {
      throw new NotFoundException('Work experience not found');
    }

    const modifiedExperiences = data.experiences.map((exp) => ({
      ...exp,
      info: exp.info?.[lang] || {},
    }));

    return {
      _id: data._id,
      userId: data.userId,
      experiences: modifiedExperiences,
    };
  }
}
