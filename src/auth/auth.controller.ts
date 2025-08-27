import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto, CreateUserDto } from '../users/dto/user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход в систему',
    description: 'Аутентификация пользователя и получение JWT токена',
  })
  @ApiBody({
    description: 'Данные для входа',
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async login(@Body() loginDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация пользователя',
    description: 'Создание нового пользователя в системе',
  })
  @ApiBody({
    description: 'Данные для регистрации',
    schema: {
      example: {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    schema: {
      example: {
        id: 2,
        email: 'newuser@example.com',
        name: 'New User',
        message: 'Пользователь успешно зарегистрирован',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 409, description: 'Пользователь уже существует' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async register(@Body() registerDto: CreateUserDto) {
    const user = await this.usersService.create(registerDto);
    return {
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
