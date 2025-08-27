import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto, CreateUserDto } from '../users/dto/user.dto';
import { User } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
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
    it('should return token and user on successful login', async () => {
      const dto: LoginUserDto = { email: 'user@example.com', password: 'pass' };
      const mockUser = { id: 1, email: dto.email } as unknown as User;
      const mockLoginResult = {
        access_token: 'token',
        user: { id: 1, email: dto.email },
      };

      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockReturnValue(mockLoginResult);

      const result = await controller.login(dto);
      expect(result).toEqual(mockLoginResult);
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
});
