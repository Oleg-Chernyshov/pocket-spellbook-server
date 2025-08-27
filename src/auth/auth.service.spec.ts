import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/user.dto';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
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
    it('should return access token and user info for valid user', () => {
      const mockToken = 'jwt-token-here';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('should handle JWT service errors', () => {
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      expect(() => service.login(mockUser)).toThrow('JWT signing failed');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });

    it('should work with different user data', () => {
      const differentUser: User = {
        ...mockUser,
        id: 2,
        email: 'another@example.com',
      };

      const mockToken = 'different-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(differentUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: differentUser.id,
          email: differentUser.email,
        },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: differentUser.email,
        sub: differentUser.id,
      });
    });

    it('should handle user with minimal data', () => {
      const minimalUser: User = {
        id: 3,
        email: 'minimal@example.com',
        password: 'hashed',
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test User',
      };

      const mockToken = 'minimal-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(minimalUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: minimalUser.id,
          email: minimalUser.email,
        },
      });
    });

    it('should not expose sensitive user information', () => {
      const mockToken = 'secure-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(mockUser);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('characters');
      expect(result.user).not.toHaveProperty('createdAt');
      expect(result.user).not.toHaveProperty('updatedAt');

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
    });
  });

  describe('edge cases', () => {
    it('should handle user with null values', () => {
      const nullUser: User = {
        id: 4,
        email: null as unknown as string,
        password: 'hashed',
        characters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Test User',
      };

      const mockToken = 'null-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(nullUser);

      expect(result.user.email).toBeNull();
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: null,
        sub: 4,
      });
    });

    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const longEmailUser: User = {
        ...mockUser,
        email: longEmail,
      };

      const mockToken = 'long-email-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.login(longEmailUser);

      expect(result.user.email).toBe(longEmail);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: longEmail,
        sub: mockUser.id,
      });
    });
  });
});
