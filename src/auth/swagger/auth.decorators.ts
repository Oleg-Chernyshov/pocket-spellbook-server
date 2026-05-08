import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const ApiLoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Вход в систему',
      description: 'Аутентификация пользователя и получение JWT токена',
    }),
    ApiBody({
      description: 'Данные для входа',
      schema: {
        example: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Успешная аутентификация',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'John Doe',
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Неверные учетные данные' }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiRegisterDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Регистрация пользователя',
      description: 'Создание нового пользователя в системе',
    }),
    ApiBody({
      description: 'Данные для регистрации',
      schema: {
        example: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        },
      },
    }),
    ApiResponse({
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
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiResponse({ status: 409, description: 'Пользователь уже существует' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiRefreshDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Обновление токена доступа',
      description:
        'Получение нового access token и refresh token используя действующий refresh token',
    }),
    ApiResponse({
      status: 200,
      description: 'Токены успешно обновлены',
      schema: {
        example: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Неверный refresh token' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiLogoutDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Выход из системы',
      description: 'Выход пользователя из системы и инвалидация refresh token',
    }),
    ApiResponse({
      status: 200,
      description: 'Успешный выход',
      schema: {
        example: {
          message: 'Выход выполнен успешно',
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Неавторизован' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );
