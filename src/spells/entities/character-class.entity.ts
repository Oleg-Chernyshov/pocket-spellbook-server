import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Spell } from './spell.entity';
import { Character } from '../../characters/entities/character.entity';

@Entity('character_classes')
export class CharacterClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'title_en', type: 'varchar', length: 100 })
  titleEn: string;

  @Column({ name: 'title_ru', type: 'varchar', length: 100 })
  titleRu: string;

  @Column({ name: 'has_spells', type: 'tinyint', default: 1 })
  hasSpells: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Spell)
  @JoinTable({
    name: 'character_class_spells',
    joinColumn: {
      name: 'character_class_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'spell_id',
      referencedColumnName: 'id',
    },
  })
  spells: Spell[];

  @OneToMany(() => Character, (character) => character.characterClass)
  characters: Character[];

  addSpell(spell: Spell): void {
    if (!this.spells) {
      this.spells = [];
    }
    this.spells.push(spell);
  }

  removeSpell(spellId: number): void {
    if (this.spells) {
      this.spells = this.spells.filter((spell) => spell.id !== spellId);
    }
  }

  hasSpell(spellId: number): boolean {
    return this.spells
      ? this.spells.some((spell) => spell.id === spellId)
      : false;
  }

  getSpellsByLevel(level: string): Spell[] {
    return this.spells
      ? this.spells.filter((spell) => spell.level === level)
      : [];
  }

  getSpellsBySchool(school: string, language: 'en' | 'ru' = 'en'): Spell[] {
    if (!this.spells) return [];

    return this.spells.filter((spell) => {
      if (!spell.translations || spell.translations.length === 0) {
        return false;
      }

      const translation =
        spell.translations.find((t) => t.language === language) ||
        spell.translations[0];

      return translation?.school === school;
    });
  }

  getTitle(language: 'en' | 'ru' = 'en'): string {
    return language === 'ru' ? this.titleRu : this.titleEn;
  }

  getSpellsCount(): number {
    return this.spells ? this.spells.length : 0;
  }

  getSpellsWithPagination(page: number = 1, limit: number = 20): Spell[] {
    if (!this.spells) return [];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return this.spells.slice(startIndex, endIndex);
  }

  getSpellsStats(): {
    total: number;
    byLevel: Record<string, number>;
    bySchool: Record<string, number>;
  } {
    if (!this.spells) {
      return {
        total: 0,
        byLevel: {},
        bySchool: {},
      };
    }

    const byLevel: Record<string, number> = {};
    const bySchool: Record<string, number> = {};

    this.spells.forEach((spell) => {
      byLevel[spell.level] = (byLevel[spell.level] || 0) + 1;

      if (spell.translations && spell.translations.length > 0) {
        const translation = spell.translations[0];
        if (translation.school) {
          bySchool[translation.school] = (bySchool[translation.school] || 0) + 1;
        }
      }
    });

    return {
      total: this.spells.length,
      byLevel,
      bySchool,
    };
  }
}
