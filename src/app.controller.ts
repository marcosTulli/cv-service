import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppInfo } from './app.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): AppInfo {
    return this.appService.getWelcome();
  }
}
