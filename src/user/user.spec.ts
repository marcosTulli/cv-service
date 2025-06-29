import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService, LocalizedUser } from './user.service';
import { User, UserDocument } from './schemas/user.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
  type MockModel = {
    find: jest.Mock;
    findById: jest.Mock;
  } & Model<UserDocument>;

  let userModel: MockModel;

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
      userModel.find.mockReturnValue({ lean: leanMock } as any);

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(leanMock).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0].name).toEqual(mockUser.name);
    });

    it('should return an empty array if no users are found', async () => {
      const leanMock = jest.fn().mockResolvedValue([]);
      userModel.find.mockReturnValue({ lean: leanMock } as any);

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(leanMock).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByIdWithLanguage', () => {
    const userId = 'someUserId123';

    it('should return a localized user when user and language exist', async () => {
      const userCopy: User = { ...mockUser };
      delete userCopy.password;

      const leanMock = jest.fn().mockResolvedValue(userCopy);
      userModel.findById.mockReturnValue({ lean: leanMock } as any);

      const lang = 'en';
      const result: LocalizedUser = await service.findByIdWithLanguage(
        userId,
        lang,
      );

      expect(userModel.findById).toHaveBeenCalledWith(userId, { password: 0 });
      expect(leanMock).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.email).toEqual(mockUser.email);
      expect(result).not.toHaveProperty('password');
      expect(result.info).toEqual(mockUser.info[lang]);
      expect(result.info.candidateTitle).toEqual(
        mockUser.info.en.candidateTitle,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      const leanMock = jest.fn().mockResolvedValue(null);
      userModel.findById.mockReturnValue({ lean: leanMock } as any);

      const lang = 'en';
      await expect(service.findByIdWithLanguage(userId, lang)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdWithLanguage(userId, lang)).rejects.toThrow(
        'User not found',
      );
      expect(userModel.findById).toHaveBeenCalledWith(userId, { password: 0 });
      expect(leanMock).toHaveBeenCalled();
    });

    it('should throw BadRequestException if language is not supported by user', async () => {
      const userUnsupportedLang: User = {
        ...mockUser,
        availableLanguages: ['en'],
      };
      delete userUnsupportedLang.password;

      const leanMock = jest.fn().mockResolvedValue(userUnsupportedLang);
      userModel.findById.mockReturnValue({ lean: leanMock } as any);

      const lang = 'fr';
      await expect(service.findByIdWithLanguage(userId, lang)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findByIdWithLanguage(userId, lang)).rejects.toThrow(
        `Language 'fr' is not supported by this user`,
      );
      expect(userModel.findById).toHaveBeenCalledWith(userId, { password: 0 });
      expect(leanMock).toHaveBeenCalled();
    });

    it('should throw NotFoundException if localized info for the language is not found', async () => {
      const userMissingLocalizedInfo: User = {
        ...mockUser,
        availableLanguages: ['en', 'de'],
        info: {
          en: { ...mockUser.info.en },
        },
      };
      delete userMissingLocalizedInfo.password;

      const leanMock = jest.fn().mockResolvedValue(userMissingLocalizedInfo);
      userModel.findById.mockReturnValue({ lean: leanMock } as any);

      const lang = 'de';
      await expect(service.findByIdWithLanguage(userId, lang)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByIdWithLanguage(userId, lang)).rejects.toThrow(
        `Localized info for 'de' not found`,
      );
      expect(userModel.findById).toHaveBeenCalledWith(userId, { password: 0 });
      expect(leanMock).toHaveBeenCalled();
    });
  });
});
