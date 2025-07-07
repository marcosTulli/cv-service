import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested } from 'class-validator';
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
