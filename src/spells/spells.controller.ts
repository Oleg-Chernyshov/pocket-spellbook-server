import { Controller, Get, Param, Query } from '@nestjs/common';
import { SpellsService } from './spells.service';
import { SpellFilterDto, PaginatedResponseDto } from './dto/spell.dto';
import { LocalizedSpell } from './interfaces/spell.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('spells')
@Controller('spells')
export class SpellsController {
  constructor(private readonly spellsService: SpellsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список заклинаний',
    description:
      'Возвращает пагинированный список заклинаний с возможностью фильтрации по уровню, школе, поиску, классу персонажа и источнику',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
    example: 20,
  })
  @ApiQuery({
    name: 'level',
    required: false,
    description: 'Уровень заклинания',
    example: '3',
  })
  @ApiQuery({
    name: 'school',
    required: false,
    description: 'Школа магии',
    example: 'Evocation',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поисковый запрос',
    example: 'fire',
  })
  @ApiQuery({
    name: 'characterClass',
    required: false,
    description: 'ID класса персонажа',
    example: 9,
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Язык локализации',
    example: 'en',
    enum: ['en', 'ru'],
  })
  @ApiQuery({
    name: 'source',
    required: false,
    description: 'Источник заклинания',
    example: 'PHB',
  })
  @ApiResponse({
    status: 200,
    description: 'Список заклинаний успешно получен',
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'Fireball',
            level: '3',
            school: 'Evocation',
            text: 'A bright streak flashes from your pointing finger...',
            castingTime: '1 action',
            range: '150 feet',
            components: 'V, S, M',
            duration: 'Instantaneous',
            source: 'PHB',
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректные параметры запроса' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async findAll(
    @Query() filters?: SpellFilterDto,
  ): Promise<PaginatedResponseDto<LocalizedSpell>> {
    return this.spellsService.findAll(filters);
  }

  @Get('classes')
  @ApiOperation({
    summary: 'Получить список всех классов персонажей',
    description:
      'Возвращает список всех доступных классов персонажей с их ID и названиями для использования в фильтрах',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Язык локализации',
    example: 'en',
    enum: ['en', 'ru'],
  })
  @ApiResponse({
    status: 200,
    description: 'Список классов персонажей успешно получен',
    schema: {
      example: [
        {
          id: 1,
          title: 'Artificer',
          titleEn: 'Artificer',
          titleRu: 'Изобретатель',
          hasSpells: 1,
        },
        {
          id: 2,
          title: 'Bard',
          titleEn: 'Bard',
          titleRu: 'Бард',
          hasSpells: 1,
        },
        {
          id: 9,
          title: 'Wizard',
          titleEn: 'Wizard',
          titleRu: 'Волшебник',
          hasSpells: 1,
        },
      ],
    },
  })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async getAllCharacterClasses(@Query('language') language?: 'en' | 'ru') {
    return this.spellsService.getAllCharacterClasses(language);
  }

  @Get('class/:classId/stats')
  @ApiOperation({
    summary: 'Получить статистику заклинаний класса',
    description:
      'Возвращает статистику заклинаний для класса персонажа с указанным ID',
  })
  @ApiParam({ name: 'classId', description: 'ID класса персонажа', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Статистика заклинаний класса успешно получена',
    schema: {
      example: {
        total: 50,
        byLevel: {
          '0': 5,
          '1': 10,
          '2': 8,
          '3': 7,
          '4': 6,
          '5': 4,
          '6': 3,
          '7': 3,
          '8': 2,
          '9': 2,
        },
        bySchool: {
          Abjuration: 8,
          Conjuration: 10,
          Divination: 5,
          Enchantment: 6,
          Evocation: 12,
          Illusion: 4,
          Necromancy: 3,
          Transmutation: 2,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Класс персонажа не найден' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async getClassSpellsStats(@Param('classId') classId: string) {
    return this.spellsService.getClassSpellsStats(+classId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить заклинание по ID',
    description: 'Возвращает заклинание с указанным ID в указанном языке',
  })
  @ApiParam({ name: 'id', description: 'ID заклинания', example: 1 })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Язык локализации',
    example: 'en',
    enum: ['en', 'ru'],
  })
  @ApiResponse({
    status: 200,
    description: 'Заклинание успешно получено',
    schema: {
      example: {
        id: 1,
        name: 'Fireball',
        level: '3',
        school: 'Evocation',
        text: 'A bright streak flashes from your pointing finger...',
        castingTime: '1 action',
        range: '150 feet',
        components: 'V, S, M',
        duration: 'Instantaneous',
        source: 'PHB',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Заклинание не найдено' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async findOne(
    @Param('id') id: string,
    @Query('language') language?: 'en' | 'ru',
  ): Promise<LocalizedSpell | null> {
    return this.spellsService.findOne(+id, language);
  }
}
