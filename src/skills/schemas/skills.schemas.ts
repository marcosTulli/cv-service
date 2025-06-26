import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SkillsDocument = Skills & Document;

@Schema()
export class SkillsContent {
  @Prop() _id: string;
  @Prop() name: string;
  @Prop() formattedName: string;
}

export const SkillsContentSchema = SchemaFactory.createForClass(SkillsContent);

@Schema({ collection: 'Skills' })
export class Skills {
  @Prop({ required: true }) _id: string;
  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;
  @Prop({ type: [SkillsContentSchema] })
  skills: SkillsContent[];
}

export const SkillsSchema = SchemaFactory.createForClass(Skills);
