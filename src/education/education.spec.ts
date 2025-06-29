import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EducationService } from './education.service';
import {
  Education,
  EducationDocument,
  EducationLocalizedContent,
} from './schemas/education.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockEducation: Education = {
  _id: '60c72b2f9c1b1f001c8a1b2a',
  userId: new Types.ObjectId('60c72b2f9c1b1f001c8a1b2b'),
  education: [
    {
      _id: 'edu1',
      url: 'http://university.com',
      en: {
        title: 'Bachelor of Science',
        content: 'Studied computer science.',
      },
      es: {
        title: 'Licenciatura en Ciencias',
        content: 'Estudió informática.',
      },
    },
    {
      _id: 'edu2',
      url: 'http://school.edu',
      en: {
        title: 'High School Diploma',
        content: 'Graduated from high school.',
      },
      es: {
        title: 'Diploma de Bachillerato',
        content: 'Graduado de secundaria.',
      },
    },
    {
      _id: 'edu3',
      url: 'http://anotheruni.com',
      en: { title: 'Master of Arts', content: 'Studied literature.' },
    },
  ],
};

describe('EducationService', () => {
  let service: EducationService;
  type MockEducationModel = {
    findOne: jest.Mock;
  } & Model<EducationDocument>;

  let educationModel: MockEducationModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EducationService,
        {
          provide: getModelToken(Education.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EducationService>(EducationService);
    educationModel = module.get(getModelToken(Education.name));
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUserIdWithLang', () => {
    const validUserId = mockEducation.userId.toHexString();
    const invalidUserId = 'invalid-id';
    const nonExistentUserId = new Types.ObjectId().toHexString();

    it('should return localized education content for a valid user and language', async () => {
      const leanMock = jest.fn().mockResolvedValue(mockEducation);
      educationModel.findOne.mockReturnValue({ lean: leanMock } as any);

      const lang = 'en';
      const result = await service.findByUserIdWithLang(lang, validUserId);

      expect(educationModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(validUserId),
      });
      expect(leanMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(mockEducation.education.length);
      expect(result[0]).toEqual({
        id: mockEducation.education[0]._id,
        url: mockEducation.education[0].url,
        title: (mockEducation.education[0].en as EducationLocalizedContent)
          .title,
        content: (mockEducation.education[0].en as EducationLocalizedContent)
          .content,
      });
      expect(result[2]).toEqual({
        id: mockEducation.education[2]._id,
        url: mockEducation.education[2].url,
        title: (mockEducation.education[2].en as EducationLocalizedContent)
          .title,
        content: (mockEducation.education[2].en as EducationLocalizedContent)
          .content,
      });
    });

    it('should throw BadRequestException if userId is invalid', async () => {
      const lang = 'en';
      await expect(
        service.findByUserIdWithLang(lang, invalidUserId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.findByUserIdWithLang(lang, invalidUserId),
      ).rejects.toThrow('Invalid userId');
      expect(educationModel.findOne).not.toHaveBeenCalled(); // findOne should not be called for invalid userId
    });

    it('should throw NotFoundException if education content is not found for the userId', async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      educationModel.findOne.mockReturnValue({ lean: leanMock } as any);

      const lang = 'en';
      await expect(
        service.findByUserIdWithLang(lang, nonExistentUserId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByUserIdWithLang(lang, nonExistentUserId),
      ).rejects.toThrow('Education content not found');
      expect(educationModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(nonExistentUserId),
      });
      expect(leanMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if localized content for the language is not found for any education item', async () => {
      const leanMock = jest.fn().mockResolvedValue(mockEducation);
      educationModel.findOne.mockReturnValue({ lean: leanMock } as any);

      const lang = 'es';
      await expect(
        service.findByUserIdWithLang(lang, validUserId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByUserIdWithLang(lang, validUserId),
      ).rejects.toThrow(`Education content not found in language: ${lang}`);
      expect(educationModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(validUserId),
      });
      expect(leanMock).toHaveBeenCalled();
    });

    it('should handle cases where localized content is undefined or not an object', async () => {
      const malformedEducation: Education = {
        ...mockEducation,
        education: [
          {
            _id: 'edu4',
            url: 'http://test.com',
            en: { title: 'Test', content: 'Content' },
            de: 'invalid string content',
          },
        ],
      };
      const leanMock = jest.fn().mockResolvedValue(malformedEducation);
      educationModel.findOne.mockReturnValue({ lean: leanMock } as any);

      const lang = 'de';
      await expect(
        service.findByUserIdWithLang(lang, validUserId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByUserIdWithLang(lang, validUserId),
      ).rejects.toThrow(`Education content not found in language: ${lang}`);
    });
  });
});
