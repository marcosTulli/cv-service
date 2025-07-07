import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { changePasswordDto } from './dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@ApiSecurity('ApiKeyAuth')
@UseGuards(ApiKeyGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup({ dto });
  }

  @Patch('change-password')
  changePassword(@Body() dto: changePasswordDto) {
    return this.authService.changePassword({ dto });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login({ dto });
  }
}
