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
import { SkillsService } from './skills.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { OwnerOnly } from 'src/guards/owner.guard';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CreateSkillDto,
  SkillFormattedNameDto,
  SkillNameDto,
  SkillsDto,
  UpdateSkillDto,
} from './dto';

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

  @OwnerOnly()
  @Post(':userId')
  async createSkill(
    @Param('userId') userId: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.service.createSkill(userId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/:skillId')
  async updateSkill(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.service.updateSkill(userId, skillId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/:skillId')
  async deleteSkill(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.service.deleteSkill(userId, skillId);
  }

  @OwnerOnly()
  @Post(':userId/:skillId/name')
  async createName(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: SkillNameDto,
  ) {
    return this.service.createName(userId, skillId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/:skillId/name')
  async updateName(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: SkillNameDto,
  ) {
    return this.service.updateName(userId, skillId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/:skillId/name')
  async deleteName(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.service.deleteName(userId, skillId);
  }

  @OwnerOnly()
  @Post(':userId/:skillId/formatted-name')
  async createFormattedName(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: SkillFormattedNameDto,
  ) {
    return this.service.createFormattedName(userId, skillId, dto);
  }

  @OwnerOnly()
  @Patch(':userId/:skillId/formatted-name')
  async updateFormattedName(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
    @Body() dto: SkillFormattedNameDto,
  ) {
    return this.service.updateFormattedName(userId, skillId, dto);
  }

  @OwnerOnly()
  @Delete(':userId/:skillId/formatted-name')
  async deleteFormattedName(
    @Param('userId') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.service.deleteFormattedName(userId, skillId);
  }
}
