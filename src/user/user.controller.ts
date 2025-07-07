import {
  Controller,
  Get,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userService.findAll();
  }

  @Get(':lang/:id')
  async findByIdWithLanguage(
    @Param('lang') lang: string,
    @Param('id') id: string,
  ): Promise<Omit<User, 'password' | 'info'>> {
    if (!lang) {
      throw new BadRequestException('Parameter "lang" is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid MongoDB ObjectId');
    }

    return this.userService.findByIdWithLanguage(id, lang);
  }
}
