import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// Icons DTO
export class IconsDto {
  @ApiProperty()
  @IsString() // Expose ObjectId as string
  _id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  key?: string;
}
