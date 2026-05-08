import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateCharacterDto, UpdateCharacterDto } from '../dto/character.dto';
import { swaggerExamples } from '../../swagger/examples';

const characterIdParam = () =>
  ApiParam({ name: 'id', description: 'ID персонажа', example: 1 });

const authErrors = () =>
  applyDecorators(
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiCreateCharacterDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Создать персонажа',
      description: 'Создает нового персонажа для текущего пользователя',
    }),
    ApiBody({
      description: 'Данные персонажа',
      type: CreateCharacterDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Персонаж успешно создан',
      schema: {
        example: {
          ...swaggerExamples.character,
          message: 'Персонаж успешно создан',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    authErrors(),
  );

export const ApiFindAllCharactersDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить всех персонажей',
      description: 'Возвращает список всех персонажей текущего пользователя',
    }),
    ApiResponse({
      status: 200,
      description: 'Список персонажей успешно получен',
      schema: {
        example: [swaggerExamples.character],
      },
    }),
    authErrors(),
  );

export const ApiFindOneCharacterDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить персонажа по ID',
      description: 'Возвращает персонажа с указанным ID',
    }),
    characterIdParam(),
    ApiResponse({
      status: 200,
      description: 'Персонаж успешно получен',
      schema: {
        example: swaggerExamples.character,
      },
    }),
    ApiResponse({ status: 404, description: 'Персонаж не найден' }),
    authErrors(),
  );

export const ApiUpdateCharacterDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Обновить персонажа',
      description: 'Обновляет данные персонажа с указанным ID',
    }),
    characterIdParam(),
    ApiBody({
      description: 'Данные для обновления',
      type: UpdateCharacterDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Персонаж успешно обновлен',
      schema: {
        example: {
          ...swaggerExamples.character,
          name: 'Gandalf the Grey',
          spellSlots: {
            '1': 4,
            '2': 3,
            '3': 3,
          },
          message: 'Персонаж успешно обновлен',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Некорректные данные' }),
    ApiResponse({ status: 404, description: 'Персонаж не найден' }),
    authErrors(),
  );

export const ApiRemoveCharacterDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Удалить персонажа',
      description: 'Удаляет персонажа с указанным ID',
    }),
    characterIdParam(),
    ApiResponse({
      status: 200,
      description: 'Персонаж успешно удален',
      schema: {
        example: {
          message: 'Персонаж успешно удален',
        },
      },
    }),
    ApiResponse({ status: 404, description: 'Персонаж не найден' }),
    authErrors(),
  );

export const ApiGetCharacterSpellsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить заклинания персонажа',
      description: 'Возвращает список всех заклинаний, изученных персонажем',
    }),
    characterIdParam(),
    ApiResponse({
      status: 200,
      description: 'Список заклинаний персонажа успешно получен',
      schema: {
        example: [swaggerExamples.localizedSpell],
      },
    }),
    ApiResponse({ status: 404, description: 'Персонаж не найден' }),
    authErrors(),
  );

export const ApiLearnSpellDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Изучить заклинание',
      description: 'Добавляет заклинание в список изученных персонажем',
    }),
    characterIdParam(),
    ApiParam({ name: 'spellId', description: 'ID заклинания', example: 1 }),
    ApiResponse({
      status: 200,
      description: 'Заклинание успешно изучено',
      schema: {
        example: {
          message: 'Заклинание Fireball успешно изучено',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Персонаж или заклинание не найдены',
    }),
    ApiResponse({ status: 401, description: 'Не авторизован' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiForgetSpellDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Забыть заклинание',
      description: 'Удаляет заклинание из списка изученных персонажем',
    }),
    characterIdParam(),
    ApiParam({ name: 'spellId', description: 'ID заклинания', example: 1 }),
    ApiResponse({
      status: 200,
      description: 'Заклинание успешно забыто',
      schema: {
        example: {
          message: 'Заклинание Fireball успешно забыто',
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Персонаж или заклинание не найдены',
    }),
    authErrors(),
  );
