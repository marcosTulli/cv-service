import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class LanguageInfo {
  @Prop() language: string;
  @Prop() level: string;
  @Prop() flag: string;
}
export const LanguageInfoSchema = SchemaFactory.createForClass(LanguageInfo);

@Schema()
export class InfoLocalized {
  @Prop() candidateTitle: string;
  @Prop() about: string;
  @Prop({ type: [LanguageInfoSchema] }) languages: LanguageInfo[];
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
  @Prop() display: string;
  @Prop() url: string;
}
export const NetworkLinkSchema = SchemaFactory.createForClass(NetworkLink);

@Schema()
export class Network {
  @Prop({ type: NetworkLinkSchema }) linkedin: NetworkLink;
  @Prop({ type: NetworkLinkSchema }) github: NetworkLink;
}
export const NetworkSchema = SchemaFactory.createForClass(Network);

@Schema({ collection: 'Users' })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: false }) password: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop() phone: string;
  @Prop() location: string;
  @Prop([String]) availableLanguages: string[];
  @Prop({ type: [CvSchema] }) cvs: Cv[];
  @Prop({ type: NetworkSchema }) network: Network;
  @Prop({ type: Map, of: InfoLocalizedSchema }) info: Record<
    string,
    InfoLocalized
  >;
}
export const UserSchema = SchemaFactory.createForClass(User);
