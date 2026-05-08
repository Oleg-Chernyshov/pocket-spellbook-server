import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { SpellsService } from './spells.service';
import { CharacterClassesService } from './services/character-classes.service';
import { SpellFilterDto, PaginatedResponseDto } from './dto/spell.dto';
import { LocalizedSpell } from './interfaces/spell.interface';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiFindAllSpellsDocs,
  ApiFindOneSpellDocs,
  ApiGetCharacterClassesDocs,
  ApiGetClassSpellsStatsDocs,
} from './swagger/spells.decorators';

@ApiTags('spells')
@Controller('spells')
export class SpellsController {
  constructor(
    private readonly spellsService: SpellsService,
    private readonly characterClassesService: CharacterClassesService,
  ) {}

  @Get()
  @ApiFindAllSpellsDocs()
  async findAll(
    @Query() filters?: SpellFilterDto,
  ): Promise<PaginatedResponseDto<LocalizedSpell>> {
    return this.spellsService.findAll(filters);
  }

  @Get('classes')
  @ApiGetCharacterClassesDocs()
  async getAllCharacterClasses(@Query('language') language?: 'en' | 'ru') {
    return this.characterClassesService.findAll(language);
  }

  @Get('class/:classId/stats')
  @ApiGetClassSpellsStatsDocs()
  async getClassSpellsStats(
    @Param('classId') classId: string,
    @Query('language') language?: 'en' | 'ru',
  ) {
    return this.characterClassesService.getSpellStats(+classId, language);
  }

  @Get(':id')
  @ApiFindOneSpellDocs()
  async findOne(
    @Param('id') id: string,
    @Query('language') language?: 'en' | 'ru',
  ): Promise<LocalizedSpell> {
    const spell = await this.spellsService.findOne(+id, language);

    if (!spell) {
      throw new NotFoundException('Spell not found');
    }

    return spell;
  }
}
