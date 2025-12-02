import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spell } from './entities/spell.entity';
import { SpellTranslation } from './entities/spell-translation.entity';
import { CharacterClass } from './entities/character-class.entity';
import {
  SpellFilter,
  LocalizedSpell,
  PaginatedSpellsResponse,
} from './interfaces/spell.interface';

@Injectable()
export class SpellsService {
  constructor(
    @InjectRepository(Spell)
    private spellsRepository: Repository<Spell>,
    @InjectRepository(SpellTranslation)
    private spellTranslationsRepository: Repository<SpellTranslation>,
    @InjectRepository(CharacterClass)
    private characterClassRepository: Repository<CharacterClass>,
  ) {}

  private localizeSpell(
    spell: Spell,
    translation: SpellTranslation,
  ): LocalizedSpell {
    return {
      id: spell.id,
      name: translation.name,
      level: spell.level,
      text: translation.text,
      school: translation.school,
      castingTime: translation.castingTime,
      range: translation.range,
      materials: translation.materials ?? '',
      components: translation.components,
      duration: translation.duration,
      source: translation.source,
      createdAt: translation.createdAt ?? spell.createdAt,
      updatedAt: translation.updatedAt ?? spell.updatedAt,
    };
  }

  private buildQueryBuilder(filters?: SpellFilter, language: 'en' | 'ru' = 'en') {
    const queryBuilder = this.spellsRepository
      .createQueryBuilder('spell')
      .innerJoinAndSelect(
        'spell.translations',
        'translation',
        'translation.language = :language',
        { language },
      );

    if (filters?.level) {
      queryBuilder.andWhere('spell.level = :level', { level: filters.level });
    }

    if (filters?.school) {
      queryBuilder.andWhere('translation.school = :school', {
        school: filters.school,
      });
    }

    if (filters?.source) {
      queryBuilder.andWhere('translation.source = :source', {
        source: filters.source,
      });
    }

    if (filters?.search) {
      const searchTerm = `${filters.search}*`;

      queryBuilder.andWhere(
        'MATCH(translation.name, translation.text) AGAINST(:search IN BOOLEAN MODE)',
        { search: searchTerm },
      );
    }

    if (filters?.characterClass) {
      queryBuilder
        .innerJoin('character_class_spells', 'ccs', 'ccs.spell_id = spell.id')
        .andWhere('ccs.character_class_id = :classId', {
          classId: filters.characterClass,
        });
    }

    return queryBuilder;
  }

  async findAll(filters?: SpellFilter): Promise<PaginatedSpellsResponse> {
    const language = filters?.language || 'en';
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildQueryBuilder(filters, language);

    if (filters?.search) {
      queryBuilder.orderBy('translation.name', 'ASC');
    } else {
      queryBuilder.orderBy('translation.name', 'ASC');
    }

    queryBuilder.skip(skip).take(limit);

    const [spells, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const data: LocalizedSpell[] = spells
      .map((spell) => {
        const translation =
          spell.translations && spell.translations.length > 0
            ? spell.translations[0]
            : null;

        return translation ? this.localizeSpell(spell, translation) : null;
      })
      .filter((spell): spell is LocalizedSpell => spell !== null);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async count(filters?: SpellFilter): Promise<number> {
    const language = filters?.language || 'en';
    const queryBuilder = this.buildQueryBuilder(filters, language);
    return queryBuilder.getCount();
  }

  async findOne(
    id: number,
    language: 'en' | 'ru' = 'en',
  ): Promise<LocalizedSpell | null> {
    const spell = await this.spellsRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!spell || !spell.translations) return null;

    const translation =
      spell.translations.find((t) => t.language === language) ||
      spell.translations.find((t) => t.language === 'en') ||
      spell.translations[0];

    if (!translation) {
      return null;
    }

    return this.localizeSpell(spell, translation);
  }

  async addSpellToClass(classId: number, spellId: number): Promise<boolean> {
    try {
      const [characterClass, spell] = await Promise.all([
        this.characterClassRepository.findOne({ where: { id: classId } }),
        this.spellsRepository.findOne({ where: { id: spellId } }),
      ]);

      if (!characterClass || !spell) {
        return false;
      }

      await this.characterClassRepository
        .createQueryBuilder()
        .insert()
        .into('character_class_spells')
        .values({
          character_class_id: classId,
          spell_id: spellId,
        })
        .execute();

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async removeSpellFromClass(
    classId: number,
    spellId: number,
  ): Promise<boolean> {
    try {
      const result = await this.characterClassRepository
        .createQueryBuilder()
        .delete()
        .from('character_class_spells')
        .where('character_class_id = :classId AND spell_id = :spellId', {
          classId,
          spellId,
        })
        .execute();

      return result?.affected ? result.affected > 0 : false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getClassSpellsStats(classId: number): Promise<{
    total: number;
    byLevel: Record<string, number>;
    bySchool: Record<string, number>;
  }> {
    const queryBuilder = this.spellsRepository
      .createQueryBuilder('spell')
      .innerJoin('character_class_spells', 'ccs', 'ccs.spell_id = spell.id')
      .innerJoin(
        'spell.translations',
        'translation',
        'translation.language = :language',
        { language: 'en' },
      )
      .where('ccs.character_class_id = :classId', { classId });

    const spells = await queryBuilder.getMany();

    const byLevel: Record<string, number> = {};
    const bySchool: Record<string, number> = {};

    spells.forEach((spell) => {
      byLevel[spell.level] = (byLevel[spell.level] || 0) + 1;
      const translation = (spell as any).translations?.[0] as
        | SpellTranslation
        | undefined;
      const school = translation?.school;
      if (school) {
        bySchool[school] = (bySchool[school] || 0) + 1;
      }
    });

    return {
      total: spells.length,
      byLevel,
      bySchool,
    };
  }

  async getCharacterSpells(
    characterId: number,
    language: 'en' | 'ru' = 'en',
  ): Promise<LocalizedSpell[]> {
    const queryBuilder = this.spellsRepository
      .createQueryBuilder('spell')
      .innerJoinAndSelect(
        'spell.translations',
        'translation',
        'translation.language = :language',
        { language },
      )
      .innerJoin('character_spells', 'cs', 'cs.spell_id = spell.id')
      .where('cs.character_id = :characterId', { characterId })
      .orderBy('translation.name', 'ASC');

    const spells = await queryBuilder.getMany();

    return spells
      .map((spell) => {
        const translation =
          spell.translations && spell.translations.length > 0
            ? spell.translations[0]
            : null;

        return translation ? this.localizeSpell(spell, translation) : null;
      })
      .filter((spell): spell is LocalizedSpell => spell !== null);
  }

  async getAllCharacterClasses(language: 'en' | 'ru' = 'en') {
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
}
