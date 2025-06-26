import { Controller, Get, Param } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

  @Get(':userId')
  async getSkills(@Param('userId') userId: string) {
    return this.service.findByUserIdWithLang(userId);
  }
}
