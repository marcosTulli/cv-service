import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { OwnerOnly } from '../guards/owner.guard';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ActivePeriodDto,
  CompanyNameDto,
  ComapnyUrlDto,
  CreateExperienceDto,
  CreateExperienceInfoDto,
  TaskDto,
  UpdateActivePeriodDto,
  UpdateExperienceDto,
  UpdateExperienceInfoDto,
  WorkExperienceDto,
} from './dto';

@ApiTags('work-experience')
@Controller('work-experience')
export class WorkExperienceController {
  constructor(private readonly service: WorkExperienceService) {}

  @ApiOkResponse({ type: WorkExperienceDto })
  @Get(':lang/:userId')
  async getLocalizedExperience(
    @Param('lang') lang: string,
    @Param('userId') userId: string,
  ) {
    return this.service.findByUserIdWithLang(lang, userId);
  }

  @OwnerOnly()
  @Post(':userId/experiences')
  async createExperience(
    @Param('userId') userId: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.service.createExperience(userId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/experiences/:experienceId')
  async updateExperience(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.service.updateExperience(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/experiences/:experienceId')
  async deleteExperience(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
  ) {
    return this.service.deleteExperience(userId, experienceId);
  }

  @OwnerOnly()
  @Post(':userId/experiences/:experienceId/company-name')
  async createCompanyName(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: CompanyNameDto,
  ) {
    return this.service.createCompanyName(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/experiences/:experienceId/company-name')
  async updateCompanyName(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: CompanyNameDto,
  ) {
    return this.service.updateCompanyName(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/experiences/:experienceId/company-name')
  async deleteCompanyName(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
  ) {
    return this.service.deleteCompanyName(userId, experienceId);
  }

  @OwnerOnly()
  @Post(':userId/experiences/:experienceId/company-url')
  async createComapnyUrl(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: ComapnyUrlDto,
  ) {
    return this.service.createComapnyUrl(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/experiences/:experienceId/company-url')
  async updateComapnyUrl(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: ComapnyUrlDto,
  ) {
    return this.service.updateComapnyUrl(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/experiences/:experienceId/company-url')
  async deleteComapnyUrl(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
  ) {
    return this.service.deleteComapnyUrl(userId, experienceId);
  }

  @OwnerOnly()
  @Post(':userId/experiences/:experienceId/active-period')
  async createActivePeriod(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: ActivePeriodDto,
  ) {
    return this.service.createActivePeriod(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/experiences/:experienceId/active-period')
  async updateActivePeriod(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Body() dto: UpdateActivePeriodDto,
  ) {
    return this.service.updateActivePeriod(userId, experienceId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/experiences/:experienceId/active-period')
  async deleteActivePeriod(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
  ) {
    return this.service.deleteActivePeriod(userId, experienceId);
  }

  // ── ExperienceInfo (per language) ──

  @OwnerOnly()
  @Post(':userId/experiences/:experienceId/info/:lang')
  async createExperienceInfo(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Param('lang') lang: string,
    @Body() dto: CreateExperienceInfoDto,
  ) {
    return this.service.createExperienceInfo(userId, experienceId, lang, dto);
  }

  @OwnerOnly()
  @Patch(':userId/experiences/:experienceId/info/:lang')
  async updateExperienceInfo(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Param('lang') lang: string,
    @Body() dto: UpdateExperienceInfoDto,
  ) {
    return this.service.updateExperienceInfo(userId, experienceId, lang, dto);
  }

  @OwnerOnly()
  @Delete(':userId/experiences/:experienceId/info/:lang')
  async deleteExperienceInfo(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Param('lang') lang: string,
  ) {
    return this.service.deleteExperienceInfo(userId, experienceId, lang);
  }

  // ── Tasks ──

  @OwnerOnly()
  @Post(':userId/experiences/:experienceId/info/:lang/tasks')
  async addTask(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Param('lang') lang: string,
    @Body() dto: TaskDto,
  ) {
    return this.service.addTask(userId, experienceId, lang, dto);
  }

  @OwnerOnly()
  @Patch(':userId/experiences/:experienceId/info/:lang/tasks/:taskId')
  async updateTask(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Param('lang') lang: string,
    @Param('taskId') taskId: string,
    @Body() dto: TaskDto,
  ) {
    return this.service.updateTask(userId, experienceId, lang, taskId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/experiences/:experienceId/info/:lang/tasks/:taskId')
  async deleteTask(
    @Param('userId') userId: string,
    @Param('experienceId') experienceId: string,
    @Param('lang') lang: string,
    @Param('taskId') taskId: string,
  ) {
    return this.service.deleteTask(userId, experienceId, lang, taskId);
  }
}
