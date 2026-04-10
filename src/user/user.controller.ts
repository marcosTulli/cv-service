import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiSecurity, ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  CreateInfoLocalizedDto,
  LanguageInfoInputDto,
  NetworkLinkInputDto,
  UpdateInfoLocalizedDto,
  UpdateLanguageInfoDto,
  UpdateNetworkLinkDto,
  UserResponse,
  UsersResponse,
} from './dto';
import { ApiKeyGuard } from '../guards/api-key.guard';
import { OwnerOnly } from '../guards/owner.guard';

@ApiTags('users')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({ type: [UsersResponse] })
  async findAll(): Promise<UsersResponse[]> {
    return this.userService.findAll();
  }

  @Get(':lang/:id')
  @ApiParam({ name: 'lang', required: true })
  @ApiParam({ name: 'id', required: true })
  @ApiOkResponse({ type: UserResponse })
  async findByIdWithLanguage(
    @Param('lang') lang: string,
    @Param('id') id: string,
  ): Promise<UserResponse> {
    if (!lang) {
      throw new BadRequestException('Parameter "lang" is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid MongoDB ObjectId');
    }

    return this.userService.findByIdWithLanguage(id, lang);
  }

  @OwnerOnly()
  @Post(':userId/info/:lang')
  async createInfoLocalized(
    @Param('userId') userId: string,
    @Param('lang') lang: string,
    @Body() dto: CreateInfoLocalizedDto,
  ) {
    return this.userService.createInfoLocalized(userId, lang, dto);
  }

  @OwnerOnly()
  @Patch(':userId/info/:lang')
  async updateInfoLocalized(
    @Param('userId') userId: string,
    @Param('lang') lang: string,
    @Body() dto: UpdateInfoLocalizedDto,
  ) {
    return this.userService.updateInfoLocalized(userId, lang, dto);
  }

  @OwnerOnly()
  @Delete(':userId/info/:lang')
  async deleteInfoLocalized(
    @Param('userId') userId: string,
    @Param('lang') lang: string,
  ) {
    return this.userService.deleteInfoLocalized(userId, lang);
  }

  @OwnerOnly()
  @Post(':userId/info/:lang/languages')
  async createLanguageInfo(
    @Param('userId') userId: string,
    @Param('lang') lang: string,
    @Body() dto: LanguageInfoInputDto,
  ) {
    return this.userService.createLanguageInfo(userId, lang, dto);
  }

  @OwnerOnly()
  @Patch(':userId/info/:lang/languages/:language')
  async updateLanguageInfo(
    @Param('userId') userId: string,
    @Param('lang') lang: string,
    @Param('language') language: string,
    @Body() dto: UpdateLanguageInfoDto,
  ) {
    return this.userService.updateLanguageInfo(userId, lang, language, dto);
  }

  @OwnerOnly()
  @Delete(':userId/info/:lang/languages/:language')
  async deleteLanguageInfo(
    @Param('userId') userId: string,
    @Param('lang') lang: string,
    @Param('language') language: string,
  ) {
    return this.userService.deleteLanguageInfo(userId, lang, language);
  }

  @OwnerOnly()
  @Post(':userId/network/:name')
  async createNetworkLink(
    @Param('userId') userId: string,
    @Param('name') name: string,
    @Body() dto: NetworkLinkInputDto,
  ) {
    return this.userService.createNetworkLink(userId, name, dto);
  }

  @OwnerOnly()
  @Patch(':userId/network/:name')
  async updateNetworkLink(
    @Param('userId') userId: string,
    @Param('name') name: string,
    @Body() dto: UpdateNetworkLinkDto,
  ) {
    return this.userService.updateNetworkLink(userId, name, dto);
  }

  @OwnerOnly()
  @Delete(':userId/network/:name')
  async deleteNetworkLink(
    @Param('userId') userId: string,
    @Param('name') name: string,
  ) {
    return this.userService.deleteNetworkLink(userId, name);
  }
}
