import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EducationLocalizedContent = {
  title: string;
  content: string;
};

export type EducationDocument = Education & Document;

@Schema()
export class EducationContent {
  @Prop() _id: string;

  @Prop() url?: string;

  [lang: string]: string | EducationLocalizedContent | undefined;
}

export const EducationContentSchema =
  SchemaFactory.createForClass(EducationContent);

@Schema({ collection: 'Education' })
export class Education {
  @Prop({ required: true }) _id: string;

  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ type: [EducationContentSchema] })
  education: EducationContent[];
}

export const EducationSchema = SchemaFactory.createForClass(Education);
