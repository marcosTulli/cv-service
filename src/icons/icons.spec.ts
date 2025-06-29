import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IconsService } from './icons.service';
import { Icons, IconsDocument } from './schemas/icons.schemas';
import { NotFoundException } from '@nestjs/common';

const mockIcon: Icons = {
  _id: new Types.ObjectId('60c72b2f9c1b1f001c8a1d2a'),
  name: 'github',
  key: 'fab fa-github',
};

describe('IconsService', () => {
  let service: IconsService;
  type MockIconsModel = {
    findOne: jest.Mock;
  } & Model<IconsDocument>;

  let iconsModel: MockIconsModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IconsService,
        {
          provide: getModelToken(Icons.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IconsService>(IconsService);
    iconsModel = module.get(getModelToken(Icons.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findIconKey', () => {
    const existingIconName = 'github';
    const nonExistentIconName = 'nonExistentIcon';

    it('should return the icon key for an existing icon name', async () => {
      const leanMock = jest.fn().mockResolvedValue(mockIcon);
      iconsModel.findOne.mockReturnValue({ lean: leanMock } as any);

      const result = await service.findIconKey(existingIconName);

      expect(iconsModel.findOne).toHaveBeenCalledWith({
        name: existingIconName,
      });
      expect(leanMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).toEqual(mockIcon.key);
    });

    it('should throw NotFoundException if icon content is not found for the name', async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      iconsModel.findOne.mockReturnValue({ lean: leanMock } as any);

      await expect(service.findIconKey(nonExistentIconName)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findIconKey(nonExistentIconName)).rejects.toThrow(
        'Icons content not found',
      );
      expect(iconsModel.findOne).toHaveBeenCalledWith({
        name: nonExistentIconName,
      });
      expect(leanMock).toHaveBeenCalled();
    });
  });
});
