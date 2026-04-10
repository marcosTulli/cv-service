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
import { WorkExperienceService } from './work-experience.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { OwnerOnly } from 'src/guards/owner.guard';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ActivePeriodDto,
  CompanyNameDto,
  ComapnyUrlDto,
  CreateExperienceDto,
  UpdateActivePeriodDto,
  UpdateExperienceDto,
  WorkExperienceDto,
} from './dto';

@ApiTags('work-experience')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
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
}
