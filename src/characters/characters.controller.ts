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
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthRequest } from '../auth/interfaces/auth-request.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CharacterSpellsService } from '../spells/services/character-spells.service';
import {
  ApiCreateCharacterDocs,
  ApiFindAllCharactersDocs,
  ApiFindOneCharacterDocs,
  ApiForgetSpellDocs,
  ApiGetCharacterSpellsDocs,
  ApiLearnSpellDocs,
  ApiRemoveCharacterDocs,
  ApiUpdateCharacterDocs,
} from './swagger/characters.decorators';

@ApiTags('characters')
@Controller('characters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CharactersController {
  constructor(
    private readonly charactersService: CharactersService,
    private readonly characterSpellsService: CharacterSpellsService,
  ) {}

  private stripClassSpells<
    T extends { characterClass?: { spells?: unknown } | null },
  >(character: T): T {
    if (!character.characterClass) {
      return character;
    }

    const { spells: _spells, ...classWithoutSpells } = character.characterClass;
    void _spells;

    return {
      ...character,
      characterClass: classWithoutSpells,
    } as T;
  }

  @Post()
  @ApiCreateCharacterDocs()
  async create(
    @Body() createCharacterDto: CreateCharacterDto,
    @Request() req: AuthRequest,
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
  @ApiFindAllCharactersDocs()
  async findAll(@Request() req: AuthRequest) {
    return this.charactersService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiFindOneCharacterDocs()
  async findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.charactersService.findOne(+id, req.user.id);
  }

  @Put(':id')
  @ApiUpdateCharacterDocs()
  async update(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
    @Request() req: AuthRequest,
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
  @ApiRemoveCharacterDocs()
  async remove(@Param('id') id: string, @Request() req: AuthRequest) {
    await this.charactersService.remove(+id, req.user.id);
    return {
      message: 'Персонаж успешно удален',
    };
  }

  @Get(':id/spells')
  @ApiGetCharacterSpellsDocs()
  async getCharacterSpells(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Query('language') language?: 'en' | 'ru',
  ) {
    // Проверяем, что персонаж принадлежит текущему пользователю
    const character = await this.charactersService.findOne(+id, req.user.id);
    const lang = language || 'en';

    return this.characterSpellsService.findByCharacter(character.id, lang);
  }

  @Post(':id/spells/:spellId')
  @ApiLearnSpellDocs()
  async learnSpell(
    @Param('id') id: string,
    @Param('spellId') spellId: string,
    @Request() req: AuthRequest,
  ) {
    const character = await this.charactersService.addSpell(
      +id,
      { spellId: +spellId },
      req.user.id,
    );
    return {
      message: `Заклинание успешно изучено`,
      character: this.stripClassSpells(character),
    };
  }

  @Delete(':id/spells/:spellId')
  @ApiForgetSpellDocs()
  async forgetSpell(
    @Param('id') id: string,
    @Param('spellId') spellId: string,
    @Request() req: AuthRequest,
  ) {
    const character = await this.charactersService.removeSpell(
      +id,
      +spellId,
      req.user.id,
    );
    return {
      message: `Заклинание успешно забыто`,
      character: this.stripClassSpells(character),
    };
  }
}
