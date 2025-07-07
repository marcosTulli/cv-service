import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum Roles {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
}

export type Role = Roles;

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
  @Prop({ type: [LanguageInfoSchema], default: [], required: true })
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
  _id?: Types.ObjectId;
  @Prop({ required: true }) name: string;

  @Prop() password?: string;

  @Prop({ required: true, unique: true }) email: string;

  @Prop({ required: true }) phone: string;

  @Prop({ required: true }) location: string;

  @Prop({ type: [String], default: [], required: true })
  availableLanguages: string[];

  @Prop({ type: [CvSchema], default: [] })
  cvs: Cv[];

  @Prop({ type: NetworkSchema, required: true })
  network: Network;

  @Prop({ type: Map, of: InfoLocalizedSchema, required: true, default: {} })
  info: Record<string, InfoLocalized>;

  @Prop({ required: true, enum: Roles, default: Roles.GUEST })
  role: Role;
}
export const UserSchema = SchemaFactory.createForClass(User);
