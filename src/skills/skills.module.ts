import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Skills, SkillsSchema } from './schemas/skills.schemas';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Skills.name, schema: SkillsSchema }]),
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService, MongooseModule],
})
export class SkillsModule {}
