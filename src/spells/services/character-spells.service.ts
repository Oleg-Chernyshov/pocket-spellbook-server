import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spell } from '../entities/spell.entity';
import { LocalizedSpell } from '../interfaces/spell.interface';
import { localizeSpells } from '../mappers/spell-localization.mapper';

@Injectable()
export class CharacterSpellsService {
  constructor(
    @InjectRepository(Spell)
    private readonly spellsRepository: Repository<Spell>,
  ) {}

  async findByCharacter(
    characterId: number,
    language: 'en' | 'ru' = 'en',
  ): Promise<LocalizedSpell[]> {
    const spells = await this.spellsRepository
      .createQueryBuilder('spell')
      .innerJoinAndSelect(
        'spell.translations',
        'translation',
        'translation.language = :language',
        { language },
      )
      .innerJoin('character_spells', 'cs', 'cs.spell_id = spell.id')
      .where('cs.character_id = :characterId', { characterId })
      .orderBy('translation.name', 'ASC')
      .getMany();

    return localizeSpells(spells);
  }
}
