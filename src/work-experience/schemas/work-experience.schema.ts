import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkExperienceDocument = WorkExperience & Document;

@Schema()
export class Task {
  @Prop() task: string;
}
export const TaskSchema = SchemaFactory.createForClass(Task);

@Schema()
export class ExperienceInfo {
  @Prop() position: string;
  @Prop({ type: [TaskSchema] }) tasks: Task[];
}
export const ExperienceInfoSchema =
  SchemaFactory.createForClass(ExperienceInfo);

@Schema()
export class ActivePeriod {
  @Prop() startDate: string;
  @Prop() endDate: string;
}
export const ActivePeriodSchema = SchemaFactory.createForClass(ActivePeriod);

@Schema()
export class Experience {
  @Prop() companyName: string;
  @Prop() companyLogo: string;
  @Prop() comapnyUrl: string;
  @Prop({ type: ActivePeriodSchema }) activePeriod: ActivePeriod;

  @Prop({ type: Map, of: ExperienceInfoSchema })
  info: Record<string, ExperienceInfo>;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);

@Schema({ collection: 'WorkExperiences' })
export class WorkExperience {
  @Prop({ require: true }) _id: string;
  @Prop({ required: true, type: Types.ObjectId }) userId: Types.ObjectId;
  @Prop({ type: [ExperienceSchema] }) experiences: Experience[];
}

export const WorkExperienceSchema =
  SchemaFactory.createForClass(WorkExperience);
