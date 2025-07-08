import { Injectable } from '@nestjs/common';
import { AppInfo } from './app.model';

@Injectable()
export class AppService {
  getWelcome(): AppInfo {
    return {
      message: 'Welcome to the Portfolio API!',
      description:
        'This API powers a personal portfolio application and provides access to user profiles, work experience, education history, skills, and more.',
      notes:
        'Some routes may require authentication. Refer to the API documentation for more details.',
      version: '1.0.0',
      status: 'OK',
      endpoints: {
        auth: '/auth',
        users: '/users',
        workExperience: '/work-experience',
        education: '/education',
        skills: '/skills',
        icons: '/icons',
      },
    };
  }
}
