import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Skills,
  SkillsContent,
  SkillsDocument,
} from './schemas/skills.schemas';
import {
  CreateSkillDto,
  SkillFormattedNameDto,
  SkillNameDto,
  UpdateSkillDto,
} from './dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skills.name)
    private readonly skillsModel: Model<SkillsDocument>,
  ) {}

  async findByUserIdWithLang(userId: string) {
    const userObjectId = this.toUserObjectId(userId);

    const data = await this.skillsModel
      .findOne({ userId: userObjectId })
      .lean();

    if (!data) {
      throw new NotFoundException('Skills content not found');
    }

    return data.skills;
  }

  async createSkill(userId: string, dto: CreateSkillDto) {
    const userObjectId = this.toUserObjectId(userId);
    const skill: SkillsContent = {
      _id: new Types.ObjectId().toString(),
      name: dto.name,
      formattedName: dto.formattedName,
    };

    const updated = await this.skillsModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        $push: { skills: skill },
        $setOnInsert: { _id: new Types.ObjectId().toString() },
      },
      { new: true, upsert: true },
    );

    return this.findSkillInDoc(updated.skills, skill._id);
  }

  async updateSkill(userId: string, skillId: string, dto: UpdateSkillDto) {
    const userObjectId = this.toUserObjectId(userId);

    const setFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        setFields[`skills.$.${key}`] = value;
      }
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const updated = await this.skillsModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'skills._id': skillId,
      },
      { $set: setFields },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Skill not found');
    }

    return this.findSkillInDoc(updated.skills, skillId);
  }

  async deleteSkill(userId: string, skillId: string) {
    const userObjectId = this.toUserObjectId(userId);

    const updated = await this.skillsModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'skills._id': skillId,
      },
      { $pull: { skills: { _id: skillId } } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Skill not found');
    }

    return { success: true };
  }

  async createName(userId: string, skillId: string, dto: SkillNameDto) {
    return this.setSkillField(userId, skillId, 'name', dto.name, 'create');
  }

  async updateName(userId: string, skillId: string, dto: SkillNameDto) {
    return this.setSkillField(userId, skillId, 'name', dto.name, 'update');
  }

  async deleteName(userId: string, skillId: string) {
    return this.unsetSkillField(userId, skillId, 'name');
  }

  async createFormattedName(
    userId: string,
    skillId: string,
    dto: SkillFormattedNameDto,
  ) {
    return this.setSkillField(
      userId,
      skillId,
      'formattedName',
      dto.formattedName,
      'create',
    );
  }

  async updateFormattedName(
    userId: string,
    skillId: string,
    dto: SkillFormattedNameDto,
  ) {
    return this.setSkillField(
      userId,
      skillId,
      'formattedName',
      dto.formattedName,
      'update',
    );
  }

  async deleteFormattedName(userId: string, skillId: string) {
    return this.unsetSkillField(userId, skillId, 'formattedName');
  }

  private async setSkillField(
    userId: string,
    skillId: string,
    field: keyof SkillsContent,
    value: unknown,
    mode: 'create' | 'update',
  ) {
    const skill = await this.getSkillOrThrow(userId, skillId);
    const current = (skill as unknown as Record<string, unknown>)[field];

    if (mode === 'create' && this.isValueSet(current)) {
      throw new ConflictException(`${field} already set`);
    }

    if (mode === 'update' && !this.isValueSet(current)) {
      throw new NotFoundException(`${field} not set`);
    }

    return this.writeSkillField(userId, skillId, field, value);
  }

  private async unsetSkillField(
    userId: string,
    skillId: string,
    field: keyof SkillsContent,
  ) {
    const skill = await this.getSkillOrThrow(userId, skillId);
    const current = (skill as unknown as Record<string, unknown>)[field];

    if (!this.isValueSet(current)) {
      throw new NotFoundException(`${field} not set`);
    }

    const userObjectId = this.toUserObjectId(userId);

    const updated = await this.skillsModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'skills._id': skillId,
      },
      { $unset: { [`skills.$.${field}`]: '' } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Skill not found');
    }

    return { success: true };
  }

  private async writeSkillField(
    userId: string,
    skillId: string,
    field: keyof SkillsContent,
    value: unknown,
  ) {
    const userObjectId = this.toUserObjectId(userId);

    const updated = await this.skillsModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'skills._id': skillId,
      },
      { $set: { [`skills.$.${field}`]: value } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Skill not found');
    }

    return this.findSkillInDoc(updated.skills, skillId);
  }

  private async getSkillOrThrow(userId: string, skillId: string) {
    const userObjectId = this.toUserObjectId(userId);

    const doc = await this.skillsModel
      .findOne({
        userId: userObjectId,
        'skills._id': skillId,
      })
      .lean();

    if (!doc) {
      throw new NotFoundException('Skill not found');
    }

    const skill = doc.skills.find((s) => s._id === skillId);
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  private findSkillInDoc(skills: SkillsContent[], skillId: string) {
    return skills.find((s) => s._id === skillId);
  }

  private toUserObjectId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    return new Types.ObjectId(userId);
  }

  private isValueSet(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.length === 0) return false;
    return true;
  }
}
