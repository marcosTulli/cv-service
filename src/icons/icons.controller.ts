import { Controller, Get, Param } from '@nestjs/common';
import { IconsService } from './icons.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { IconsDto } from './dto';

@ApiTags('icons')
@Controller('icons')
export class IconsController {
  constructor(private readonly service: IconsService) {}

  @ApiOkResponse({ type: IconsDto })
  @Get(':name')
  async getSkills(@Param('name') name: string) {
    return this.service.findIconKey(name);
  }
}
