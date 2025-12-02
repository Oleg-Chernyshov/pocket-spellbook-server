import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SpellsService } from '../spells/spells.service';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: number;
    email: string;
  };
}

@ApiTags('characters')
@Controller('characters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CharactersController {
  constructor(
    private readonly charactersService: CharactersService,
    private readonly spellsService: SpellsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Создать персонажа',
    description: 'Создает нового персонажа для текущего пользователя',
  })
  @ApiBody({
    description: 'Данные персонажа',
    type: CreateCharacterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Персонаж успешно создан',
    schema: {
      example: {
        id: 1,
        name: 'Gandalf',
        characterClassId: 1,
        spellSlots: {
          '1': 4,
          '2': 3,
          '3': 2,
        },
        message: 'Персонаж успешно создан',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async create(
    @Body() createCharacterDto: CreateCharacterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const character = await this.charactersService.create(
      createCharacterDto,
      req.user.id,
    );
    return {
      ...character,
      message: 'Персонаж успешно создан',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Получить всех персонажей',
    description: 'Возвращает список всех персонажей текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Список персонажей успешно получен',
    schema: {
      example: [
        {
          id: 1,
          name: 'Gandalf',
          characterClassId: 1,
          spellSlots: {
            '1': 4,
            '2': 3,
            '3': 2,
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.charactersService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить персонажа по ID',
    description: 'Возвращает персонажа с указанным ID',
  })
  @ApiParam({ name: 'id', description: 'ID персонажа', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Персонаж успешно получен',
    schema: {
      example: {
        id: 1,
        name: 'Gandalf',
        characterClassId: 1,
        spellSlots: {
          '1': 4,
          '2': 3,
          '3': 2,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Персонаж не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.charactersService.findOne(+id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Обновить персонажа',
    description: 'Обновляет данные персонажа с указанным ID',
  })
  @ApiParam({ name: 'id', description: 'ID персонажа', example: 1 })
  @ApiBody({
    description: 'Данные для обновления',
    type: UpdateCharacterDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Персонаж успешно обновлен',
    schema: {
      example: {
        id: 1,
        name: 'Gandalf the Grey',
        characterClassId: 1,
        spellSlots: {
          '1': 4,
          '2': 3,
          '3': 3,
        },
        message: 'Персонаж успешно обновлен',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 404, description: 'Персонаж не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async update(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const character = await this.charactersService.update(
      +id,
      updateCharacterDto,
      req.user.id,
    );
    return {
      ...character,
      message: 'Персонаж успешно обновлен',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить персонажа',
    description: 'Удаляет персонажа с указанным ID',
  })
  @ApiParam({ name: 'id', description: 'ID персонажа', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Персонаж успешно удален',
    schema: {
      example: {
        message: 'Персонаж успешно удален',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Персонаж не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    await this.charactersService.remove(+id, req.user.id);
    return {
      message: 'Персонаж успешно удален',
    };
  }

  @Get(':id/spells')
  @ApiOperation({
    summary: 'Получить заклинания персонажа',
    description: 'Возвращает список всех заклинаний, изученных персонажем',
  })
  @ApiParam({ name: 'id', description: 'ID персонажа', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Список заклинаний персонажа успешно получен',
    schema: {
      example: [
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
    },
  })
  @ApiResponse({ status: 404, description: 'Персонаж не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async getCharacterSpells(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Query('language') language?: 'en' | 'ru',
  ) {
    // Проверяем, что персонаж принадлежит текущему пользователю
    const character = await this.charactersService.findOne(+id, req.user.id);
    const lang = language || 'en';

    return this.spellsService.getCharacterSpells(character.id, lang);
  }

  @Post(':id/spells/:spellId')
  @ApiOperation({
    summary: 'Изучить заклинание',
    description: 'Добавляет заклинание в список изученных персонажем',
  })
  @ApiParam({ name: 'id', description: 'ID персонажа', example: 1 })
  @ApiParam({ name: 'spellId', description: 'ID заклинания', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Заклинание успешно изучено',
    schema: {
      example: {
        message: 'Заклинание Fireball успешно изучено',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Персонаж или заклинание не найдены',
  })
  @ApiResponse({
    status: 400,
    description: 'Заклинание недоступно для класса персонажа',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async learnSpell(
    @Param('id') id: string,
    @Param('spellId') spellId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const character = await this.charactersService.addSpell(
      +id,
      { spellId: +spellId },
      req.user.id,
    );
    const sanitizedCharacter = character.characterClass
      ? (() => {
          const { spells: _spells, ...classWithoutSpells } =
            character.characterClass;
          void _spells;
          return { ...character, characterClass: classWithoutSpells };
        })()
      : character;
    return {
      message: `Заклинание успешно изучено`,
      character: sanitizedCharacter,
    };
  }

  @Delete(':id/spells/:spellId')
  @ApiOperation({
    summary: 'Забыть заклинание',
    description: 'Удаляет заклинание из списка изученных персонажем',
  })
  @ApiParam({ name: 'id', description: 'ID персонажа', example: 1 })
  @ApiParam({ name: 'spellId', description: 'ID заклинания', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Заклинание успешно забыто',
    schema: {
      example: {
        message: 'Заклинание Fireball успешно забыто',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Персонаж или заклинание не найдены',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Внутренняя ошибка сервера' })
  async forgetSpell(
    @Param('id') id: string,
    @Param('spellId') spellId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const character = await this.charactersService.removeSpell(
      +id,
      +spellId,
      req.user.id,
    );
    const sanitizedCharacter = character.characterClass
      ? (() => {
          const { spells: _spells, ...classWithoutSpells } =
            character.characterClass;
          void _spells;
          return { ...character, characterClass: classWithoutSpells };
        })()
      : character;
    return {
      message: `Заклинание успешно забыто`,
      character: sanitizedCharacter,
    };
  }
}
