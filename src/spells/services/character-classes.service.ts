import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterClass } from '../entities/character-class.entity';
import { Spell } from '../entities/spell.entity';
import { buildSpellStats, SpellStats } from '../utils/spell-stats.util';

@Injectable()
export class CharacterClassesService {
  constructor(
    @InjectRepository(CharacterClass)
    private readonly characterClassRepository: Repository<CharacterClass>,
    @InjectRepository(Spell)
    private readonly spellsRepository: Repository<Spell>,
  ) {}

  async findAll(language: 'en' | 'ru' = 'en') {
    const classes = await this.characterClassRepository.find({
      order: { id: 'ASC' },
    });

    return classes.map((cls) => ({
      id: cls.id,
      title: language === 'ru' ? cls.titleRu : cls.titleEn,
      titleEn: cls.titleEn,
      titleRu: cls.titleRu,
      hasSpells: cls.hasSpells,
    }));
  }

  async getSpellStats(
    classId: number,
    language: 'en' | 'ru' = 'en',
  ): Promise<SpellStats> {
    const spells = await this.spellsRepository
      .createQueryBuilder('spell')
      .innerJoin('character_class_spells', 'ccs', 'ccs.spell_id = spell.id')
      .innerJoinAndSelect(
        'spell.translations',
        'translation',
        'translation.language = :language',
        { language },
      )
      .where('ccs.character_class_id = :classId', { classId })
      .getMany();

    return buildSpellStats(spells);
  }
}
