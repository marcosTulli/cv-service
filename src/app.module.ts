import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import AuthModule from './auth/auth.module';
import { WorkExperienceModule } from './work-experience/work-experience.module';
import { EducationModule } from './education/education.module';
import { SkillsModule } from './skills/skills.module';
import { IconsModule } from './icons/icons.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        dbName: configService.get<string>('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    WorkExperienceModule,
    EducationModule,
    SkillsModule,
    IconsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
