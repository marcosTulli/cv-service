import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserService, LocalizedUser } from './user.service';
import { User } from './schemas/user.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockUserId = new Types.ObjectId().toString();

const mockUser: User = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '123-456-7890',
  location: 'Test City',
  availableLanguages: ['en', 'es'],
  cvs: [{ cvEn: 'cv_en_path', cvEs: 'cv_es_path' }],
  network: {
    linkedin: { display: 'LinkedIn Profile', url: 'https://linkedin.com/test' },
    github: { display: 'GitHub Profile', url: 'https://github.com/test' },
  },
  info: {
    en: {
      candidateTitle: 'Software Engineer (EN)',
      about: 'About me in English.',
      languages: [
        { language: 'English', level: 'Native', flag: '🇬🇧' },
        { language: 'Spanish', level: 'Intermediate', flag: '🇪🇸' },
      ],
    },
    es: {
      candidateTitle: 'Ingeniero de Software (ES)',
      about: 'Sobre mí en Español.',
      languages: [
        { language: 'Español', level: 'Nativo', flag: '🇪🇸' },
        { language: 'Inglés', level: 'Avanzado', flag: '🇬🇧' },
      ],
    },
  },
  password: 'hashedpassword123',
};

describe('UserService', () => {
  let service: UserService;
  let userModel: {
    find: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get(getModelToken(User.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const leanMock = jest.fn().mockResolvedValue([mockUser]);
      userModel.find.mockReturnValue({ lean: leanMock });

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(leanMock).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0].name).toEqual(mockUser.name);
    });

    it('should return an empty array if no users are found', async () => {
      const leanMock = jest.fn().mockResolvedValue([]);
      userModel.find.mockReturnValue({ lean: leanMock });

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByIdWithLanguage', () => {
    it('should return a localized user when user and language exist', async () => {
      const userCopy = { ...mockUser };
      delete userCopy.password;

      const leanMock = jest.fn().mockResolvedValue(userCopy);
      userModel.findById.mockReturnValue({ lean: leanMock });

      const result: LocalizedUser = await service.findByIdWithLanguage(
        mockUserId,
        'en',
      );

      expect(userModel.findById).toHaveBeenCalledWith(mockUserId, {
        password: 0,
      });
      expect(result.email).toEqual(mockUser.email);
      expect(result.info).toEqual(mockUser.info.en);
    });

    it('should throw BadRequestException if userId is invalid', async () => {
      await expect(
        service.findByIdWithLanguage('invalid_id', 'en'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      userModel.findById.mockReturnValue({ lean: leanMock });

      await expect(
        service.findByIdWithLanguage(mockUserId, 'en'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if language is not supported', async () => {
      const leanMock = jest.fn().mockResolvedValue({
        ...mockUser,
        availableLanguages: ['en'],
      });
      userModel.findById.mockReturnValue({ lean: leanMock });

      await expect(
        service.findByIdWithLanguage(mockUserId, 'fr'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if localized info for language not found', async () => {
      const leanMock = jest.fn().mockResolvedValue({
        ...mockUser,
        availableLanguages: ['en', 'de'],
        info: { en: mockUser.info.en }, // no 'de'
      });
      userModel.findById.mockReturnValue({ lean: leanMock });

      await expect(
        service.findByIdWithLanguage(mockUserId, 'de'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
