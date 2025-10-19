import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spell } from './entities/spell.entity';
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
    @InjectRepository(CharacterClass)
    private characterClassRepository: Repository<CharacterClass>,
  ) {}

  private localizeSpell(
    spell: Spell,
    language: 'en' | 'ru' = 'en',
  ): LocalizedSpell {
    if (language === 'ru') {
      return {
        id: spell.id,
        name: spell.nameRu,
        level: spell.level,
        text: spell.textRu,
        school: spell.schoolRu,
        castingTime: spell.castingTimeRu,
        range: spell.rangeRu,
        materials: spell.materialsRu,
        components: spell.componentsRu,
        duration: spell.durationRu,
        source: spell.sourceRu,
        createdAt: spell.createdAt,
        updatedAt: spell.updatedAt,
      };
    }

    return {
      id: spell.id,
      name: spell.nameEn,
      level: spell.level,
      text: spell.textEn,
      school: spell.schoolEn,
      castingTime: spell.castingTimeEn,
      range: spell.rangeEn,
      materials: spell.materialsEn,
      components: spell.componentsEn,
      duration: spell.durationEn,
      source: spell.sourceEn,
      createdAt: spell.createdAt,
      updatedAt: spell.updatedAt,
    };
  }

  private buildQueryBuilder(filters?: SpellFilter) {
    const queryBuilder = this.spellsRepository.createQueryBuilder('spell');

    if (filters?.level) {
      queryBuilder.andWhere('spell.level = :level', { level: filters.level });
    }

    if (filters?.school) {
      if (filters.language === 'ru') {
        queryBuilder.andWhere('spell.schoolRu = :school', {
          school: filters.school,
        });
      } else {
        queryBuilder.andWhere('spell.schoolEn = :school', {
          school: filters.school,
        });
      }
    }

    if (filters?.source) {
      if (filters.language === 'ru') {
        queryBuilder.andWhere('spell.sourceRu = :source', {
          source: filters.source,
        });
      } else {
        queryBuilder.andWhere('spell.sourceEn = :source', {
          source: filters.source,
        });
      }
    }

    if (filters?.search) {
      const searchTerm = `${filters.search}*`;

      if (filters.language === 'ru') {
        queryBuilder.andWhere(
          'MATCH(spell.name_ru, spell.text_ru) AGAINST(:search IN BOOLEAN MODE)',
          { search: searchTerm },
        );
      } else {
        queryBuilder.andWhere(
          'MATCH(spell.name_en, spell.text_en) AGAINST(:search IN BOOLEAN MODE)',
          { search: searchTerm },
        );
      }
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
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildQueryBuilder(filters);
    const total = await queryBuilder.getCount();

    queryBuilder.skip(skip).take(limit);

    if (filters?.search) {
      if (filters.language === 'ru') {
        queryBuilder.orderBy('spell.nameRu', 'ASC');
      } else {
        queryBuilder.orderBy('spell.nameEn', 'ASC');
      }
    } else {
      if (filters?.language === 'ru') {
        queryBuilder.orderBy('spell.nameRu', 'ASC');
      } else {
        queryBuilder.orderBy('spell.nameEn', 'ASC');
      }
    }

    const spells = await queryBuilder.getMany();
    const language = filters?.language || 'en';

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: spells.map((spell) => this.localizeSpell(spell, language)),
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
    const queryBuilder = this.buildQueryBuilder(filters);
    return queryBuilder.getCount();
  }

  async findOne(
    id: number,
    language: 'en' | 'ru' = 'en',
  ): Promise<LocalizedSpell | null> {
    const spell = await this.spellsRepository.findOne({ where: { id } });
    if (!spell) return null;

    return this.localizeSpell(spell, language);
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
    const queryBuilder = this.spellsRepository.createQueryBuilder('spell');

    queryBuilder
      .innerJoin('character_class_spells', 'ccs', 'ccs.spell_id = spell.id')
      .where('ccs.character_class_id = :classId', { classId });

    const spells = await queryBuilder.getMany();

    const byLevel: Record<string, number> = {};
    const bySchool: Record<string, number> = {};

    spells.forEach((spell) => {
      byLevel[spell.level] = (byLevel[spell.level] || 0) + 1;
      bySchool[spell.schoolEn] = (bySchool[spell.schoolEn] || 0) + 1;
    });

    return {
      total: spells.length,
      byLevel,
      bySchool,
    };
  }
}
