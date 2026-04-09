import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CreateEducationDto,
  EducationDto,
  EducationTranslationDto,
  EducationUrlDto,
  UpdateEducationDto,
  UpdateEducationTranslationDto,
} from './dto';

@ApiTags('education')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('education')
export class EdcuationController {
  constructor(private readonly service: EducationService) {}

  @ApiOkResponse({ type: EducationDto })
  @Get(':lang/:userId')
  async getLocalizedEducation(
    @Param('lang') lang: string,
    @Param('userId') userId: string,
  ) {
    return this.service.findByUserIdWithLang(lang, userId);
  }

  @Post(':userId')
  async createEducation(
    @Param('userId') userId: string,
    @Body() dto: CreateEducationDto,
  ) {
    return this.service.createEducation(userId, dto);
  }

  @Patch(':userId/:educationId')
  async updateEducation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Body() dto: UpdateEducationDto,
  ) {
    return this.service.updateEducation(userId, educationId, dto);
  }

  @Delete(':userId/:educationId')
  async deleteEducation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.service.deleteEducation(userId, educationId);
  }

  @Post(':userId/:educationId/url')
  async createUrl(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Body() dto: EducationUrlDto,
  ) {
    return this.service.createUrl(userId, educationId, dto);
  }

  @Patch(':userId/:educationId/url')
  async updateUrl(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Body() dto: EducationUrlDto,
  ) {
    return this.service.updateUrl(userId, educationId, dto);
  }

  @Delete(':userId/:educationId/url')
  async deleteUrl(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.service.deleteUrl(userId, educationId);
  }

  @Post(':userId/:educationId/translations/:lang')
  async createTranslation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Param('lang') lang: string,
    @Body() dto: EducationTranslationDto,
  ) {
    return this.service.createTranslation(userId, educationId, lang, dto);
  }

  @Patch(':userId/:educationId/translations/:lang')
  async updateTranslation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Param('lang') lang: string,
    @Body() dto: UpdateEducationTranslationDto,
  ) {
    return this.service.updateTranslation(userId, educationId, lang, dto);
  }

  @Delete(':userId/:educationId/translations/:lang')
  async deleteTranslation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Param('lang') lang: string,
  ) {
    return this.service.deleteTranslation(userId, educationId, lang);
  }
}
