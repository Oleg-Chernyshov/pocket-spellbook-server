import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { swaggerExamples } from '../../swagger/examples';

const languageQuery = () =>
  ApiQuery({
    name: 'language',
    required: false,
    description: 'Язык локализации',
    example: 'en',
    enum: ['en', 'ru'],
  });

export const ApiFindAllSpellsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить список заклинаний',
      description:
        'Возвращает пагинированный список заклинаний с возможностью фильтрации по уровню, школе, поиску, классу персонажа и источнику',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Номер страницы',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Количество элементов на странице',
      example: 20,
    }),
    ApiQuery({
      name: 'level',
      required: false,
      description: 'Уровень заклинания',
      example: '3',
    }),
    ApiQuery({
      name: 'school',
      required: false,
      description: 'Школа магии',
      example: 'Evocation',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Поисковый запрос',
      example: 'fire',
    }),
    ApiQuery({
      name: 'characterClass',
      required: false,
      description: 'ID класса персонажа',
      example: 9,
    }),
    languageQuery(),
    ApiQuery({
      name: 'source',
      required: false,
      description: 'Источник заклинания',
      example: 'PHB',
    }),
    ApiResponse({
      status: 200,
      description: 'Список заклинаний успешно получен',
      schema: {
        example: {
          data: [swaggerExamples.localizedSpell],
          pagination: swaggerExamples.pagination,
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Некорректные параметры запроса' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiGetCharacterClassesDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить список всех классов персонажей',
      description:
        'Возвращает список всех доступных классов персонажей с их ID и названиями для использования в фильтрах',
    }),
    languageQuery(),
    ApiResponse({
      status: 200,
      description: 'Список классов персонажей успешно получен',
      schema: {
        example: swaggerExamples.characterClasses,
      },
    }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiGetClassSpellsStatsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить статистику заклинаний класса',
      description:
        'Возвращает статистику заклинаний для класса персонажа с указанным ID',
    }),
    ApiParam({
      name: 'classId',
      description: 'ID класса персонажа',
      example: 1,
    }),
    languageQuery(),
    ApiResponse({
      status: 200,
      description: 'Статистика заклинаний класса успешно получена',
      schema: {
        example: swaggerExamples.spellStats,
      },
    }),
    ApiResponse({ status: 404, description: 'Класс персонажа не найден' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );

export const ApiFindOneSpellDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить заклинание по ID',
      description: 'Возвращает заклинание с указанным ID в указанном языке',
    }),
    ApiParam({ name: 'id', description: 'ID заклинания', example: 1 }),
    languageQuery(),
    ApiResponse({
      status: 200,
      description: 'Заклинание успешно получено',
      schema: {
        example: swaggerExamples.localizedSpell,
      },
    }),
    ApiResponse({ status: 404, description: 'Spell not found' }),
    ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' }),
  );
