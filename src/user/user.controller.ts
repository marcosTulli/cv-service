import {
  Controller,
  Get,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiSecurity, ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserResponse, UsersResponse } from './dto';

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
}
