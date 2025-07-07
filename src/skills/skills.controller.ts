import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SkillsDto } from './dto';

@ApiTags('skills')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

  @ApiOkResponse({ type: SkillsDto })
  @Get(':userId')
  async getSkills(@Param('userId') userId: string) {
    return this.service.findByUserIdWithLang(userId);
  }
}
