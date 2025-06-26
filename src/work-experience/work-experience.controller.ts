import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('work-experience')
export class WorkExperienceController {
  constructor(private readonly service: WorkExperienceService) {}

  @Get(':lan/:userId')
  async getLocalizedExperience(
    @Param('lang') lang: string,
    @Param('userId') userId: string,
  ) {
    return this.service.findByUserIdWithLang(lang, userId);
  }
}
