import { ApiProperty } from '@nestjs/swagger';
import { Role, Roles } from '../schemas/user.schema';

export class CvDto {
  @ApiProperty({ required: false }) cvEn?: string;
  @ApiProperty({ required: false }) cvEs?: string;
}

export class NetworkLinkDto {
  @ApiProperty() display: string;
  @ApiProperty() url: string;
}

export class NetworkDto {
  @ApiProperty({ type: NetworkLinkDto }) linkedin: NetworkLinkDto;
  @ApiProperty({ type: NetworkLinkDto }) github: NetworkLinkDto;
}

export class UsersResponse {
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() phone: string;
  @ApiProperty() location: string;
  @ApiProperty({ type: [String] }) availableLanguages: string[];
  @ApiProperty({ type: [CvDto] }) cvs: CvDto[];
  @ApiProperty({ type: NetworkDto }) network: NetworkDto;
  @ApiProperty({ enum: Roles }) role: Role;
  @ApiProperty() _id: string;
}
