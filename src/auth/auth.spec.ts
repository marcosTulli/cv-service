import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../user/schemas/user.schema';
import { ForbiddenException } from '@nestjs/common';
import * as argon from 'argon2';
import { Types } from 'mongoose';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let userModelFindOne: jest.Mock;
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    userModelFindOne = jest.fn();
    jwtService = { signAsync: jest.fn() };
    configService = { get: jest.fn() };

    // Mock Mongoose model constructor
    const MockUserModel = Object.assign(
      jest.fn().mockImplementation(() => ({
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(undefined),
      })),
      {
        findOne: userModelFindOne,
      },
    );

    MockUserModel.findOne = userModelFindOne;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return a token', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
      };
      const hashedPassword = 'hashedPassword';
      const token = 'jwtToken';

      jest.spyOn(argon, 'hash').mockResolvedValue(hashedPassword);
      userModelFindOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      configService.get.mockReturnValue('secret');
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.signup({ dto });

      expect(userModelFindOne).toHaveBeenCalledWith({ email: dto.email });
      expect(argon.hash).toHaveBeenCalledWith(dto.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ email: dto.email }),
        { expiresIn: '15m', secret: 'secret' },
      );
      expect(result).toEqual({ access_token: token });
    });

    it('should throw ForbiddenException if email is taken', async () => {
      const dto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password',
      };
      userModelFindOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ email: dto.email }),
      });

      await expect(service.signup({ dto })).rejects.toThrow(ForbiddenException);
      expect(userModelFindOne).toHaveBeenCalledWith({ email: dto.email });
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const userId = new Types.ObjectId().toString();
      const token = 'jwtToken';
      const user = {
        _id: userId,
        email: dto.email,
        password: 'hashedPassword',
      };

      userModelFindOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });
      jest.spyOn(argon, 'verify').mockResolvedValue(true);
      configService.get.mockReturnValue('secret');
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.login({ dto });

      expect(userModelFindOne).toHaveBeenCalledWith({ email: dto.email });
      expect(argon.verify).toHaveBeenCalledWith(user.password, dto.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email: dto.email },
        { expiresIn: '15m', secret: 'secret' },
      );
      expect(result).toEqual({ access_token: token });
    });

    it('should throw ForbiddenException if user not found', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      userModelFindOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login({ dto })).rejects.toThrow(ForbiddenException);
      expect(userModelFindOne).toHaveBeenCalledWith({ email: dto.email });
    });

    it('should throw ForbiddenException if password is incorrect', async () => {
      const dto = { email: 'test@example.com', password: 'wrong' };
      const user = {
        _id: new Types.ObjectId().toString(),
        email: dto.email,
        password: 'hashedPassword',
      };

      userModelFindOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });
      jest.spyOn(argon, 'verify').mockResolvedValue(false);

      await expect(service.login({ dto })).rejects.toThrow(ForbiddenException);
      expect(userModelFindOne).toHaveBeenCalledWith({ email: dto.email });
      expect(argon.verify).toHaveBeenCalledWith(user.password, dto.password);
    });
  });

  describe('signToken', () => {
    it('should return a signed JWT token', async () => {
      const userId = new Types.ObjectId().toString();
      const email = 'test@example.com';
      const token = 'jwtToken';
      configService.get.mockReturnValue('secret');
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.signToken({ userId, email });

      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: userId, email },
        { expiresIn: '15m', secret: 'secret' },
      );
      expect(result).toEqual({ access_token: token });
    });
  });
});
