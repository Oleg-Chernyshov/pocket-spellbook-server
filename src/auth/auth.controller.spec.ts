import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto, CreateUserDto } from '../users/dto/user.dto';
import { User } from '../users/entities/user.entity';
import { AuthRequest } from './interfaces/auth-request.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token, refresh token and user on successful login', async () => {
      const dto: LoginUserDto = { email: 'user@example.com', password: 'pass' };
      const mockUser = { id: 1, email: dto.email } as unknown as User;
      const mockLoginResult = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: { id: 1, email: dto.email },
      };

      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

      const result = await controller.login(dto);
      expect(result).toEqual(mockLoginResult);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(authService.validateUser).toHaveBeenCalledWith(dto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should propagate errors from authService', async () => {
      const dto: LoginUserDto = { email: 'user@example.com', password: 'pass' };
      (authService.validateUser as jest.Mock).mockRejectedValue(
        new Error('Invalid'),
      );

      await expect(controller.login(dto)).rejects.toThrow('Invalid');
      expect(authService.validateUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('register', () => {
    it('should create user and return message with safe user fields', async () => {
      const dto: CreateUserDto = {
        email: 'new@example.com',
        password: 'pass',
      };
      const created = {
        id: 2,
        email: dto.email,
        name: 'User Name',
        password: 'hashed',
        refreshToken: null,
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (usersService.create as jest.Mock).mockResolvedValue(created);

      const result = await controller.register(dto);
      expect(result).toEqual({
        message: 'Пользователь успешно зарегистрирован',
        user: { id: created.id, email: created.email, name: created.name },
      });
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });

    it('should propagate errors from usersService', async () => {
      const dto: CreateUserDto = {
        email: 'dup@example.com',
        password: 'pass',
      };
      (usersService.create as jest.Mock).mockRejectedValue(
        new Error('Conflict'),
      );

      await expect(controller.register(dto)).rejects.toThrow('Conflict');
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('refresh', () => {
    it('should return new access and refresh tokens', async () => {
      const mockRequest = {
        user: {
          sub: 1,
          email: 'user@example.com',
          refreshToken: 'valid-refresh-token',
        },
      } as Partial<AuthRequest> as AuthRequest;

      const mockRefreshResult = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      (authService.refreshTokens as jest.Mock).mockResolvedValue(
        mockRefreshResult,
      );

      const result = await controller.refresh(mockRequest);

      expect(result).toEqual(mockRefreshResult);
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        1,
        'valid-refresh-token',
      );
    });

    it('should extract userId and refreshToken from request correctly', async () => {
      const mockRequest = {
        user: {
          sub: 99,
          email: 'test@example.com',
          refreshToken: 'test-refresh-token',
        },
      } as Partial<AuthRequest> as AuthRequest;

      const mockRefreshResult = {
        access_token: 'token1',
        refresh_token: 'token2',
      };

      (authService.refreshTokens as jest.Mock).mockResolvedValue(
        mockRefreshResult,
      );

      await controller.refresh(mockRequest);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        99,
        'test-refresh-token',
      );
    });

    it('should propagate errors from authService.refreshTokens', async () => {
      const mockRequest = {
        user: {
          sub: 1,
          email: 'user@example.com',
          refreshToken: 'invalid-token',
        },
      } as Partial<AuthRequest> as AuthRequest;

      (authService.refreshTokens as jest.Mock).mockRejectedValue(
        new Error('Invalid refresh token'),
      );

      await expect(controller.refresh(mockRequest)).rejects.toThrow(
        'Invalid refresh token',
      );
      expect(authService.refreshTokens).toHaveBeenCalledWith(
        1,
        'invalid-token',
      );
    });
  });

  describe('logout', () => {
    it('should logout user and return success message', async () => {
      const mockRequest = {
        user: {
          sub: 1,
          email: 'user@example.com',
        },
      } as Partial<AuthRequest> as AuthRequest;

      const mockLogoutResult = {
        message: 'Выход выполнен успешно',
      };

      (authService.logout as jest.Mock).mockResolvedValue(mockLogoutResult);

      const result = await controller.logout(mockRequest);

      expect(result).toEqual(mockLogoutResult);
      expect(authService.logout).toHaveBeenCalledWith(1);
    });

    it('should extract userId from request correctly', async () => {
      const mockRequest = {
        user: {
          sub: 42,
          email: 'another@example.com',
        },
      } as Partial<AuthRequest> as AuthRequest;

      (authService.logout as jest.Mock).mockResolvedValue({
        message: 'Выход выполнен успешно',
      });

      await controller.logout(mockRequest);

      expect(authService.logout).toHaveBeenCalledWith(42);
    });

    it('should propagate errors from authService.logout', async () => {
      const mockRequest = {
        user: {
          sub: 1,
          email: 'user@example.com',
        },
      } as Partial<AuthRequest> as AuthRequest;

      (authService.logout as jest.Mock).mockRejectedValue(
        new Error('Logout failed'),
      );

      await expect(controller.logout(mockRequest)).rejects.toThrow(
        'Logout failed',
      );
      expect(authService.logout).toHaveBeenCalledWith(1);
    });
  });
});
