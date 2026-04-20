import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  WorkExperienceDocument,
  WorkExperience,
  Experience,
} from './schemas/work-experience.schema';
import {
  CreateExperienceDto,
  UpdateExperienceDto,
  CompanyNameDto,
  ComapnyUrlDto,
  ActivePeriodDto,
  UpdateActivePeriodDto,
  CreateExperienceInfoDto,
  UpdateExperienceInfoDto,
  TaskDto,
} from './dto';

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

    return modifiedExperiences;
  }

  async createExperience(userId: string, dto: CreateExperienceDto) {
    const userObjectId = this.toUserObjectId(userId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        $push: { experiences: dto },
        $setOnInsert: { _id: new Types.ObjectId().toString() },
      },
      { new: true, upsert: true },
    );

    return updated.experiences[updated.experiences.length - 1];
  }

  async updateExperience(
    userId: string,
    experienceId: string,
    dto: UpdateExperienceDto,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const setFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        setFields[`experiences.$.${key}`] = value;
      }
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const updated = await this.workExperienceModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'experiences._id': experienceObjectId,
      },
      { $set: setFields },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return this.findExperienceInDoc(updated, experienceId);
  }

  async deleteExperience(userId: string, experienceId: string) {
    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'experiences._id': experienceObjectId,
      },
      { $pull: { experiences: { _id: experienceObjectId } } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return { success: true };
  }

  async createCompanyName(
    userId: string,
    experienceId: string,
    dto: CompanyNameDto,
  ) {
    return this.setExperienceField(
      userId,
      experienceId,
      'companyName',
      dto.companyName,
      'create',
    );
  }

  async updateCompanyName(
    userId: string,
    experienceId: string,
    dto: CompanyNameDto,
  ) {
    return this.setExperienceField(
      userId,
      experienceId,
      'companyName',
      dto.companyName,
      'update',
    );
  }

  async deleteCompanyName(userId: string, experienceId: string) {
    return this.unsetExperienceField(userId, experienceId, 'companyName');
  }

  async createComapnyUrl(
    userId: string,
    experienceId: string,
    dto: ComapnyUrlDto,
  ) {
    return this.setExperienceField(
      userId,
      experienceId,
      'comapnyUrl',
      dto.comapnyUrl,
      'create',
    );
  }

  async updateComapnyUrl(
    userId: string,
    experienceId: string,
    dto: ComapnyUrlDto,
  ) {
    return this.setExperienceField(
      userId,
      experienceId,
      'comapnyUrl',
      dto.comapnyUrl,
      'update',
    );
  }

  async deleteComapnyUrl(userId: string, experienceId: string) {
    return this.unsetExperienceField(userId, experienceId, 'comapnyUrl');
  }

  async createActivePeriod(
    userId: string,
    experienceId: string,
    dto: ActivePeriodDto,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);

    if (this.isValueSet(experience.activePeriod)) {
      throw new ConflictException('Active period already set');
    }

    return this.writeExperienceField(userId, experienceId, 'activePeriod', dto);
  }

  async updateActivePeriod(
    userId: string,
    experienceId: string,
    dto: UpdateActivePeriodDto,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);

    if (!this.isValueSet(experience.activePeriod)) {
      throw new NotFoundException('Active period not set');
    }

    const merged: ActivePeriodDto = {
      startDate: dto.startDate ?? experience.activePeriod.startDate,
      endDate: dto.endDate ?? experience.activePeriod.endDate,
    };

    return this.writeExperienceField(
      userId,
      experienceId,
      'activePeriod',
      merged,
    );
  }

  async deleteActivePeriod(userId: string, experienceId: string) {
    return this.unsetExperienceField(userId, experienceId, 'activePeriod');
  }

  // ── ExperienceInfo (per language) ──

  async createExperienceInfo(
    userId: string,
    experienceId: string,
    lang: string,
    dto: CreateExperienceInfoDto,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);
    const existing = experience.info?.[lang];

    if (existing) {
      throw new ConflictException(`Info for language "${lang}" already set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId, 'experiences._id': experienceObjectId },
      {
        $set: {
          [`experiences.$.info.${lang}`]: {
            position: dto.position,
            tasks: dto.tasks ?? [],
          },
        },
      },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return this.findExperienceInDoc(updated, experienceId);
  }

  async updateExperienceInfo(
    userId: string,
    experienceId: string,
    lang: string,
    dto: UpdateExperienceInfoDto,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);
    const existing = experience.info?.[lang];

    if (!existing) {
      throw new NotFoundException(`Info for language "${lang}" not set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const setFields: Record<string, unknown> = {};
    if (dto.position !== undefined) {
      setFields[`experiences.$.info.${lang}.position`] = dto.position;
    }
    if (dto.tasks !== undefined) {
      setFields[`experiences.$.info.${lang}.tasks`] = dto.tasks;
    }

    if (Object.keys(setFields).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId, 'experiences._id': experienceObjectId },
      { $set: setFields },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return this.findExperienceInDoc(updated, experienceId);
  }

  async deleteExperienceInfo(
    userId: string,
    experienceId: string,
    lang: string,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);

    if (!experience.info?.[lang]) {
      throw new NotFoundException(`Info for language "${lang}" not set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId, 'experiences._id': experienceObjectId },
      { $unset: { [`experiences.$.info.${lang}`]: '' } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return { success: true };
  }

  // ── Tasks (within a language's info) ──

  async addTask(
    userId: string,
    experienceId: string,
    lang: string,
    dto: TaskDto,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);

    if (!experience.info?.[lang]) {
      throw new NotFoundException(`Info for language "${lang}" not set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId, 'experiences._id': experienceObjectId },
      { $push: { [`experiences.$.info.${lang}.tasks`]: dto } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return this.findExperienceInDoc(updated, experienceId);
  }

  async updateTask(
    userId: string,
    experienceId: string,
    lang: string,
    taskId: string,
    dto: TaskDto,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);
    const info = experience.info?.[lang];

    if (!info) {
      throw new NotFoundException(`Info for language "${lang}" not set`);
    }

    const taskExists = info.tasks?.some(
      (t) => (t as unknown as { _id?: Types.ObjectId })._id?.toString() === taskId,
    );

    if (!taskExists) {
      throw new NotFoundException('Task not found');
    }

    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException('Invalid taskId');
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId, 'experiences._id': experienceObjectId },
      { $set: { [`experiences.$.info.${lang}.tasks.$[t].task`]: dto.task } },
      { new: true, arrayFilters: [{ 't._id': new Types.ObjectId(taskId) }] },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return this.findExperienceInDoc(updated, experienceId);
  }

  async deleteTask(
    userId: string,
    experienceId: string,
    lang: string,
    taskId: string,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);
    const info = experience.info?.[lang];

    if (!info) {
      throw new NotFoundException(`Info for language "${lang}" not set`);
    }

    if (!Types.ObjectId.isValid(taskId)) {
      throw new BadRequestException('Invalid taskId');
    }

    const taskExists = info.tasks?.some(
      (t) => (t as unknown as { _id?: Types.ObjectId })._id?.toString() === taskId,
    );

    if (!taskExists) {
      throw new NotFoundException('Task not found');
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      { userId: userObjectId, 'experiences._id': experienceObjectId },
      {
        $pull: {
          [`experiences.$.info.${lang}.tasks`]: {
            _id: new Types.ObjectId(taskId),
          },
        },
      },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return { success: true };
  }

  private async setExperienceField(
    userId: string,
    experienceId: string,
    field: keyof Experience,
    value: unknown,
    mode: 'create' | 'update',
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);
    const current = (experience as unknown as Record<string, unknown>)[field];

    if (mode === 'create' && this.isValueSet(current)) {
      throw new ConflictException(`${field} already set`);
    }

    if (mode === 'update' && !this.isValueSet(current)) {
      throw new NotFoundException(`${field} not set`);
    }

    return this.writeExperienceField(userId, experienceId, field, value);
  }

  private async unsetExperienceField(
    userId: string,
    experienceId: string,
    field: keyof Experience,
  ) {
    const experience = await this.getExperienceOrThrow(userId, experienceId);
    const current = (experience as unknown as Record<string, unknown>)[field];

    if (!this.isValueSet(current)) {
      throw new NotFoundException(`${field} not set`);
    }

    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'experiences._id': experienceObjectId,
      },
      { $unset: { [`experiences.$.${field}`]: '' } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return { success: true };
  }

  private async writeExperienceField(
    userId: string,
    experienceId: string,
    field: keyof Experience,
    value: unknown,
  ) {
    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const updated = await this.workExperienceModel.findOneAndUpdate(
      {
        userId: userObjectId,
        'experiences._id': experienceObjectId,
      },
      { $set: { [`experiences.$.${field}`]: value } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return this.findExperienceInDoc(updated, experienceId);
  }

  private async getExperienceOrThrow(userId: string, experienceId: string) {
    const userObjectId = this.toUserObjectId(userId);
    const experienceObjectId = this.toExperienceObjectId(experienceId);

    const doc = await this.workExperienceModel
      .findOne({
        userId: userObjectId,
        'experiences._id': experienceObjectId,
      })
      .lean();

    if (!doc) {
      throw new NotFoundException('Experience not found');
    }

    const experience = doc.experiences.find(
      (e) =>
        (e as Experience & { _id?: Types.ObjectId })._id?.toString() ===
        experienceId,
    );

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return experience;
  }

  private findExperienceInDoc(
    doc: WorkExperienceDocument,
    experienceId: string,
  ) {
    return doc.experiences.find(
      (e) =>
        (e as Experience & { _id?: Types.ObjectId })._id?.toString() ===
        experienceId,
    );
  }

  private toUserObjectId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }
    return new Types.ObjectId(userId);
  }

  private toExperienceObjectId(experienceId: string) {
    if (!Types.ObjectId.isValid(experienceId)) {
      throw new BadRequestException('Invalid experienceId');
    }
    return new Types.ObjectId(experienceId);
  }

  private isValueSet(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.length === 0) return false;
    return true;
  }
}
