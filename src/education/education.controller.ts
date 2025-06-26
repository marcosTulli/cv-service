import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EducationService } from './education.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('education')
export class EdcuationController {
  constructor(private readonly service: EducationService) {}

  @Get(':lang/:userId')
  async getLocalizedEducation(
    @Param('lang') lang: string,
    @Param('userId') userId: string,
  ) {
    return this.service.findByUserIdWithLang(lang, userId);
  }
}
