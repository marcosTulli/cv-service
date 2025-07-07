import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { IconsService } from './icons.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('icons')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('icons')
export class IconsController {
  constructor(private readonly service: IconsService) {}

  @Get(':name')
  async getSkills(@Param('name') name: string) {
    return this.service.findIconKey(name);
  }
}
