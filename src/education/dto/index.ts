import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EducationLocalizedContentDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;
}

export class EducationContentDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;
  [lang: string]: any;
}

export class EducationDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ type: [EducationContentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationContentDto)
  education: EducationContentDto[];
}

export class CreateEducationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Localized content keyed by language code',
    example: {
      en: { title: 'BSc Computer Science', content: 'University of X' },
      es: { title: 'Lic. Informática', content: 'Universidad X' },
    },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, EducationLocalizedContentDto>;
}

export class UpdateEducationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Localized content keyed by language code',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  translations?: Record<string, EducationLocalizedContentDto>;
}

export class EducationUrlDto {
  @ApiProperty()
  @IsString()
  url: string;
}

export class EducationTranslationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;
}

export class UpdateEducationTranslationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;
}
