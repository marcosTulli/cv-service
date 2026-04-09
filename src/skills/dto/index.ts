import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SkillsContentDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  formattedName: string;
}

export class SkillsDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ type: [SkillsContentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillsContentDto)
  skills: SkillsContentDto[];
}

export class CreateSkillDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  formattedName: string;
}

export class UpdateSkillDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  formattedName?: string;
}

export class SkillNameDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class SkillFormattedNameDto {
  @ApiProperty()
  @IsString()
  formattedName: string;
}
