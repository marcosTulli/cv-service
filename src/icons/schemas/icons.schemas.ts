import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type IconsDocument = Icons & Document;

@Schema({ collection: 'Icons' })
export class Icons {
  @Prop({ required: true, type: Types.ObjectId })
  _id: Types.ObjectId;
  @Prop() name: string;
  @Prop() key: string;
}

export const IconsSchema = SchemaFactory.createForClass(Icons);
