import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkExperienceController } from './work-experience.controller';
import {
  WorkExperience,
  WorkExperienceSchema,
} from './schemas/work-experience.schema';
import { WorkExperienceService } from './work-experience.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkExperience.name, schema: WorkExperienceSchema },
    ]),
  ],

  controllers: [WorkExperienceController],
  providers: [WorkExperienceService],
  exports: [WorkExperienceService, MongooseModule],
})
export class WorkExperienceModule {}
