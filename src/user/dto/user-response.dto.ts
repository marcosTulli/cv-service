import { ApiProperty } from '@nestjs/swagger';
import { UsersResponse } from './users-response.dto';

export class LanguageInfoDto {
  @ApiProperty() language: string;
  @ApiProperty() level: string;
  @ApiProperty() flag: string;
}

export class InfoLocalizedDto {
  @ApiProperty() candidateTitle: string;
  @ApiProperty() about: string;
  @ApiProperty({ type: [LanguageInfoDto] }) languages: LanguageInfoDto[];
}

export class UserResponse extends UsersResponse {
  @ApiProperty({ type: InfoLocalizedDto }) info: InfoLocalizedDto;
}
