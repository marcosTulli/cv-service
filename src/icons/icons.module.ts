import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Icons, IconsSchema } from './schemas/icons.schemas';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Icons.name, schema: IconsSchema }]),
  ],
  controllers: [IconsController],
  providers: [IconsService],
  exports: [IconsService, MongooseModule],
})
export class IconsModule {}
