import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
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
