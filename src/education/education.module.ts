import { Education, EducationSchema } from './schemas/education.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { EdcuationController } from './education.controller';
import { EducationService } from './education.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Education.name, schema: EducationSchema },
    ]),
  ],
  controllers: [EdcuationController],
  providers: [EducationService],
  exports: [EducationService, MongooseModule],
})
export class EducationModule {}
