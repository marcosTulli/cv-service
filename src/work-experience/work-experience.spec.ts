import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WorkExperienceService } from './work-experience.service';
import { WorkExperience } from './schemas/work-experience.schema';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

describe('WorkExperienceService', () => {
  let service: WorkExperienceService;

  const mockLean = jest.fn();
  const mockFindOne = jest.fn().mockReturnValue({ lean: mockLean });

  const mockModel = {
    findOne: mockFindOne,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkExperienceService,
        {
          provide: getModelToken(WorkExperience.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<WorkExperienceService>(WorkExperienceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if no data is found', async () => {
    mockLean.mockResolvedValue(null);

    await expect(
      service.findByUserIdWithLang('en', new Types.ObjectId().toString()),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return modified experiences when data is found', async () => {
    const userId = new Types.ObjectId();
    const mockData = {
      _id: '1',
      userId,
      experiences: [
        {
          companyName: 'Test Co',
          companyLogo: 'logo.png',
          comapnyUrl: 'https://test.com',
          activePeriod: {
            startDate: '2021-01',
            endDate: '2022-01',
          },
          info: {
            en: {
              position: 'Developer',
              tasks: [{ task: 'Code' }],
            },
            es: {
              position: 'Developer',
              tasks: [{ task: 'Code' }],
            },
          },
        },
      ],
    };

    mockLean.mockResolvedValue(mockData);

    const result = await service.findByUserIdWithLang('en', userId.toString());

    expect(result).toEqual([
      {
        ...mockData.experiences[0],
        info: mockData.experiences[0].info.en,
      },
    ]);
  });
});
