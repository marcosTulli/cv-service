import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class LanguageInfo {
  @Prop({ required: true }) language: string;
  @Prop({ required: true }) level: string;
  @Prop({ required: true }) flag: string;
}
export const LanguageInfoSchema = SchemaFactory.createForClass(LanguageInfo);

@Schema()
export class InfoLocalized {
  @Prop({ required: true }) candidateTitle: string;
  @Prop({ required: true }) about: string;
  @Prop({ type: [LanguageInfoSchema], required: true, default: [] })
  languages: LanguageInfo[];
}
export const InfoLocalizedSchema = SchemaFactory.createForClass(InfoLocalized);

@Schema()
export class Cv {
  @Prop() cvEn?: string;
  @Prop() cvEs?: string;
}
export const CvSchema = SchemaFactory.createForClass(Cv);

@Schema()
export class NetworkLink {
  @Prop({ required: true }) display: string;
  @Prop({ required: true }) url: string;
}
export const NetworkLinkSchema = SchemaFactory.createForClass(NetworkLink);

@Schema()
export class Network {
  @Prop({ type: NetworkLinkSchema, required: true })
  linkedin: NetworkLink;

  @Prop({ type: NetworkLinkSchema, required: true })
  github: NetworkLink;
}
export const NetworkSchema = SchemaFactory.createForClass(Network);

@Schema({ collection: 'Users' })
export class User {
  @Prop({ required: true }) name: string;
  @Prop() password?: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) phone: string;
  @Prop({ required: true }) location: string;
  @Prop({ type: [String], required: true, default: [] })
  availableLanguages: string[];
  @Prop({ type: [CvSchema], default: [] })
  cvs: Cv[];
  @Prop({ type: NetworkSchema, required: true })
  network: Network;
  @Prop({ type: Map, of: InfoLocalizedSchema, required: true, default: {} })
  info: Record<string, InfoLocalized>;
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_: unknown, ret: Partial<User> & { _id?: Types.ObjectId }) => {
    if (ret._id && typeof ret._id.toString === 'function') {
      ret._id = ret._id.toString() as unknown as Types.ObjectId;
    }
    return ret;
  },
});
