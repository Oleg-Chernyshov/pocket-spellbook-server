import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/user.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    refreshToken: null,
    characters: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should successfully validate user with correct credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.validateUser.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.validateUser).toHaveBeenCalledWith(loginUserDto);
      expect(usersService.validateUser).toHaveBeenCalledTimes(1);
    });

    it('should return null when user validation fails', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      const result = await service.validateUser(loginUserDto);

      expect(result).toBeNull();
      expect(usersService.validateUser).toHaveBeenCalledWith(loginUserDto);
    });

    it('should handle validation errors gracefully', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.validateUser.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.validateUser(loginUserDto)).rejects.toThrow(
        'Database error',
      );
      expect(usersService.validateUser).toHaveBeenCalledWith(loginUserDto);
    });

    it('should handle empty credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: '',
        password: '',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      const result = await service.validateUser(loginUserDto);

      expect(result).toBeNull();
      expect(usersService.validateUser).toHaveBeenCalledWith(loginUserDto);
    });

    it('should handle special characters in email', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test+tag@example.com',
        password: 'password123',
      };

      mockUsersService.validateUser.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginUserDto);

      expect(result).toEqual(mockUser);
      expect(usersService.validateUser).toHaveBeenCalledWith(loginUserDto);
    });
  });

  describe('login', () => {
    it('should return access token, refresh token and user info for valid user', async () => {
      const mockAccessToken = 'access-token-here';
      const mockRefreshToken = 'refresh-token-here';
      const mockHashedToken = 'hashed-refresh-token';

      mockJwtService.sign.mockReturnValueOnce(mockAccessToken);
      mockJwtService.sign.mockReturnValueOnce(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedToken);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRefreshToken, 10);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockHashedToken,
      );
    });

    it('should not expose sensitive user information', async () => {
      const mockAccessToken = 'access-token';
      const mockRefreshToken = 'refresh-token';
      const mockHashedToken = 'hashed-token';

      mockJwtService.sign.mockReturnValueOnce(mockAccessToken);
      mockJwtService.sign.mockReturnValueOnce(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedToken);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login(mockUser);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('characters');
      expect(result.user).not.toHaveProperty('createdAt');
      expect(result.user).not.toHaveProperty('updatedAt');
      expect(result.user).not.toHaveProperty('refreshToken');

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
    });
  });

  describe('refreshTokens', () => {
    const userId = 1;
    const refreshToken = 'valid-refresh-token';
    const hashedRefreshToken = 'hashed-refresh-token';

    it('should successfully refresh tokens with valid refresh token', async () => {
      const userWithRefreshToken: User = {
        ...mockUser,
        refreshToken: hashedRefreshToken,
      };

      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      const newHashedToken = 'new-hashed-token';

      mockUsersService.findById.mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce(newAccessToken);
      mockJwtService.sign.mockReturnValueOnce(newRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHashedToken);
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refreshTokens(userId, refreshToken);

      expect(result).toEqual({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      });

      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        hashedRefreshToken,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        newHashedToken,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        'Доступ запрещен',
      );

      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException if user has no refresh token', async () => {
      const userWithoutToken: User = {
        ...mockUser,
        refreshToken: null,
      };

      mockUsersService.findById.mockResolvedValue(userWithoutToken);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException if refresh token does not match', async () => {
      const userWithRefreshToken: User = {
        ...mockUser,
        refreshToken: hashedRefreshToken,
      };

      mockUsersService.findById.mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens(userId, refreshToken)).rejects.toThrow(
        'Доступ запрещен',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        refreshToken,
        hashedRefreshToken,
      );
    });

    it('should generate new tokens with correct payload', async () => {
      const userWithRefreshToken: User = {
        ...mockUser,
        id: 5,
        email: 'specific@example.com',
        refreshToken: hashedRefreshToken,
      };

      mockUsersService.findById.mockResolvedValue(userWithRefreshToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('access');
      mockJwtService.sign.mockReturnValueOnce('refresh');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.refreshTokens(5, refreshToken);

      const expectedPayload = {
        email: 'specific@example.com',
        sub: 5,
      };

      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
    });
  });

  describe('logout', () => {
    it('should successfully logout user and clear refresh token', async () => {
      const userId = 1;
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout(userId);

      expect(result).toEqual({ message: 'Выход выполнен успешно' });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        null,
      );
    });

    it('should handle logout for different user IDs', async () => {
      const userId = 99;
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(userId);

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        null,
      );
    });

    it('should handle database errors during logout', async () => {
      const userId = 1;
      mockUsersService.updateRefreshToken.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.logout(userId)).rejects.toThrow('Database error');
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        null,
      );
    });
  });
});
