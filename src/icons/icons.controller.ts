import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { IconsService } from './icons.service';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IconsDto } from './dto';

@ApiTags('icons')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('icons')
export class IconsController {
  constructor(private readonly service: IconsService) {}

  @ApiOkResponse({ type: IconsDto })
  @Get(':name')
  async getSkills(@Param('name') name: string) {
    return this.service.findIconKey(name);
  }
}
