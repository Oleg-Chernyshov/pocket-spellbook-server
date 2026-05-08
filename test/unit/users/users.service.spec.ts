import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../../../src/users/entities/user.entity';
import { CreateUserDto, LoginUserDto } from '../../../src/users/dto/user.dto';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const hashedPassword = 'hashedPassword123';
      const mockUser: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const existingUser: Partial<User> = { id: 1, email: 'test@example.com' };
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(existingUser as User);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';
      const mockUser: Partial<User> = { id: 1, email };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(loginUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginUserDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.validateUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginUserDto.email },
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUser.password,
      );
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const id = 1;
      const mockUser: Partial<User> = { id: 1, email: 'test@example.com' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.findById(id);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should return null if user not found', async () => {
      const id = 999;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findById(id);

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('repository errors', () => {
    it('should handle bcrypt hash errors gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Hash failed',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
    });

    it('should handle database save errors gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      const mockUser: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as User);
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('Save failed'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Save failed',
      );
    });

    it('should handle bcrypt compare errors gracefully', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Compare failed'),
      );

      await expect(service.validateUser(loginUserDto)).rejects.toThrow(
        'Compare failed',
      );
    });
  });
});
