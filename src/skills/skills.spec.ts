import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SkillsService } from './skills.service';
import { Skills, SkillsDocument } from './schemas/skills.schemas';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockSkills: Skills = {
  _id: '60c72b2f9c1b1f001c8a1c2a',
  userId: new Types.ObjectId('60c72b2f9c1b1f001c8a1c2b'),
  skills: [
    { _id: 'skill1', name: 'JavaScript', formattedName: 'JavaScript' },
    { _id: 'skill2', name: 'TypeScript', formattedName: 'TypeScript' },
    { _id: 'skill3', name: 'NestJS', formattedName: 'Nest.js' },
    { _id: 'skill4', name: 'MongoDB', formattedName: 'MongoDB' },
  ],
};

describe('SkillsService', () => {
  let service: SkillsService;
  type MockSkillsModel = {
    findOne: jest.Mock;
  } & Model<SkillsDocument>;

  let skillsModel: MockSkillsModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        {
          provide: getModelToken(Skills.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
    skillsModel = module.get(getModelToken(Skills.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserIdWithLang', () => {
    const validUserId = mockSkills.userId.toHexString();
    const invalidUserId = 'invalid-id';
    const nonExistentUserId = new Types.ObjectId().toHexString();

    it('should return skills content for a valid userId', async () => {
      const leanMock = jest.fn().mockResolvedValue(mockSkills);
      skillsModel.findOne.mockReturnValue({ lean: leanMock } as any);

      const result = await service.findByUserIdWithLang(validUserId);

      expect(skillsModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(validUserId),
      });
      expect(leanMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(mockSkills.skills.length);
      expect(result).toEqual(mockSkills.skills);
    });

    it('should throw BadRequestException if userId is invalid', async () => {
      await expect(service.findByUserIdWithLang(invalidUserId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findByUserIdWithLang(invalidUserId)).rejects.toThrow(
        'Invalid userId',
      );
      expect(skillsModel.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if skills content is not found for the userId', async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      skillsModel.findOne.mockReturnValue({ lean: leanMock } as any);

      await expect(
        service.findByUserIdWithLang(nonExistentUserId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByUserIdWithLang(nonExistentUserId),
      ).rejects.toThrow('Skills content not found');
      expect(skillsModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(nonExistentUserId),
      });
      expect(leanMock).toHaveBeenCalled();
    });
  });
});
