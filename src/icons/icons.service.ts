import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Icons, IconsDocument } from './schemas/icons.schemas';

@Injectable()
export class IconsService {
  constructor(
    @InjectModel(Icons.name)
    private readonly iconsModel: Model<IconsDocument>,
  ) {}

  async findIconKey(name: string) {
    const data = await this.iconsModel.findOne({ name }).lean();

    if (!data) {
      throw new NotFoundException('Icons content not found');
    }

    return data.key;
  }
}
