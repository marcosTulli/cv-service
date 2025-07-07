import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkExperienceService } from './work-experience.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { WorkExperienceDto } from './dto';

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
}
