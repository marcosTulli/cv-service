import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockUsers = [
  {
    _id: 'user1',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashedpwd',
    availableLanguages: ['en', 'es'],
  },
  {
    _id: 'user2',
    name: 'Bob',
    email: 'bob@example.com',
    password: 'anotherpwd',
    availableLanguages: ['en'],
  },
];

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockUsers),
            }),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        {
          _id: 'user1',
          name: 'Alice',
          email: 'alice@example.com',
          availableLanguages: ['en', 'es'],
        },
        {
          _id: 'user2',
          name: 'Bob',
          email: 'bob@example.com',
          availableLanguages: ['en'],
        },
      ]);
    });
  });

  describe('findByIdWithLanguage', () => {
    it('should return user without password if language is available', async () => {
      const user = {
        _id: 'user1',
        name: 'Alice',
        email: 'alice@example.com',
        availableLanguages: ['en', 'es'],
        // no password included!
      };

      const findByIdMock = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(user),
      });

      (model.findById as jest.Mock).mockImplementation(findByIdMock);

      const result = await service.findByIdWithLanguage('user1', 'es');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const findByIdMock = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      (model.findById as jest.Mock).mockImplementation(findByIdMock);

      await expect(
        service.findByIdWithLanguage('nonexistent', 'en'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if language is not supported', async () => {
      const user = {
        ...mockUsers[1],
      };
      const findByIdMock = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(user),
      });
      (model.findById as jest.Mock).mockImplementation(findByIdMock);

      await expect(service.findByIdWithLanguage('user2', 'es')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
