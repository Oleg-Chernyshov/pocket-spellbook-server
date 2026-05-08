import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spell } from './entities/spell.entity';
import {
  SpellFilter,
  LocalizedSpell,
  PaginatedSpellsResponse,
} from './interfaces/spell.interface';
import {
  localizeSpell,
  localizeSpells,
} from './mappers/spell-localization.mapper';

@Injectable()
export class SpellsService {
  constructor(
    @InjectRepository(Spell)
    private readonly spellsRepository: Repository<Spell>,
  ) {}

  private buildQueryBuilder(
    filters?: SpellFilter,
    language: 'en' | 'ru' = 'en',
  ) {
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
      const databaseType =
        this.spellsRepository.manager.connection.options.type;

      if (databaseType === 'mysql' || databaseType === 'mariadb') {
        queryBuilder.andWhere(
          'MATCH(translation.name, translation.text) AGAINST(:search IN BOOLEAN MODE)',
          { search: `${filters.search}*` },
        );
      } else {
        queryBuilder.andWhere(
          '(LOWER(translation.name) LIKE LOWER(:search) OR LOWER(translation.text) LIKE LOWER(:search))',
          { search: `%${filters.search}%` },
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
    const language = filters?.language || 'en';
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildQueryBuilder(filters, language);

    queryBuilder.orderBy('translation.name', 'ASC').skip(skip).take(limit);

    const [spells, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: localizeSpells(spells),
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

    return localizeSpell(spell, translation);
  }
}
