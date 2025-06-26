import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Skills, SkillsDocument } from './schemas/skills.schemas';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skills.name)
    private readonly skillsModel: Model<SkillsDocument>,
  ) {}

  async findByUserIdWithLang(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    const data = await this.skillsModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();

    if (!data) {
      throw new NotFoundException('Skills content not found');
    }

    return data.skills;
  }
}
