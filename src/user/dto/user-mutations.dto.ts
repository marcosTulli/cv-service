import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LanguageInfoInputDto {
  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  @IsString()
  level: string;

  @ApiProperty()
  @IsString()
  flag: string;
}

export class UpdateLanguageInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flag?: string;
}

export class CreateInfoLocalizedDto {
  @ApiProperty()
  @IsString()
  candidateTitle: string;

  @ApiProperty()
  @IsString()
  about: string;

  @ApiPropertyOptional({ type: [LanguageInfoInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageInfoInputDto)
  languages?: LanguageInfoInputDto[];
}

export class UpdateInfoLocalizedDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  candidateTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  about?: string;
}

export class NetworkLinkInputDto {
  @ApiProperty()
  @IsString()
  display: string;

  @ApiProperty()
  @IsString()
  url: string;
}

export class UpdateNetworkLinkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  display?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;
}
