import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaskDto {
  @ApiProperty()
  @IsString()
  task: string;
}

export class ExperienceInfoDto {
  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty({ type: [TaskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks: TaskDto[];
}

export class ActivePeriodDto {
  @ApiProperty()
  @IsString()
  startDate: string;

  @ApiProperty()
  @IsString()
  endDate: string;
}

export class ExperienceDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiProperty()
  @IsString()
  companyLogo: string;

  @ApiProperty()
  @IsString()
  comapnyUrl: string;

  @ApiProperty({ type: ActivePeriodDto })
  @ValidateNested()
  @Type(() => ActivePeriodDto)
  activePeriod: ActivePeriodDto;

  @ApiProperty({
    description: 'Localized info with language codes as keys',
    example: {
      en: { position: 'Developer', tasks: [{ task: 'Coding' }] },
      es: { position: 'Desarrollador', tasks: [{ task: 'Programar' }] },
    },
    type: Object,
  })
  @IsObject()
  info: Record<string, ExperienceInfoDto>;
}

export class WorkExperienceDto {
  @ApiProperty()
  @IsString()
  _id: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ type: [ExperienceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences: ExperienceDto[];
}

export class CreateExperienceDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comapnyUrl?: string;

  @ApiPropertyOptional({ type: ActivePeriodDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ActivePeriodDto)
  activePeriod?: ActivePeriodDto;

  @ApiPropertyOptional({
    description: 'Localized info with language codes as keys',
    example: {
      en: { position: 'Developer', tasks: [{ task: 'Coding' }] },
    },
    type: Object,
  })
  @IsOptional()
  @IsObject()
  info?: Record<string, ExperienceInfoDto>;
}

export class UpdateExperienceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comapnyUrl?: string;

  @ApiPropertyOptional({ type: ActivePeriodDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ActivePeriodDto)
  activePeriod?: ActivePeriodDto;

  @ApiPropertyOptional({
    description: 'Localized info with language codes as keys',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  info?: Record<string, ExperienceInfoDto>;
}

export class CompanyNameDto {
  @ApiProperty()
  @IsString()
  companyName: string;
}

export class ComapnyUrlDto {
  @ApiProperty()
  @IsString()
  comapnyUrl: string;
}

export class UpdateActivePeriodDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}
