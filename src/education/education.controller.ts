import { Controller, Get, Param } from '@nestjs/common';
import { EducationService } from './education.service';

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
