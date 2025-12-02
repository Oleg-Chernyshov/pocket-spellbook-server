import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CharacterClass } from '../../spells/entities/character-class.entity';
import { Spell } from '../../spells/entities/spell.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'character_class_id' })
  characterClassId: number;

  @Column({ name: 'spell_slots', type: 'json' })
  spellSlots: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.characters)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => CharacterClass,
    (characterClass) => characterClass.characters,
  )
  @JoinColumn({ name: 'character_class_id' })
  characterClass: CharacterClass;

  @ManyToMany(() => Spell)
  @JoinTable({
    name: 'character_spells',
    joinColumn: {
      name: 'character_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'spell_id',
      referencedColumnName: 'id',
    },
  })
  spells: Spell[];

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

  canLearnSpell(spell: Spell): boolean {
    if (!this.characterClass) return false;

    return this.characterClass.hasSpell(spell.id);
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

  getKnownSpellsCount(): number {
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

  hasSpellSlot(level: string): boolean {
    const slots = this.spellSlots[level];
    return slots !== undefined && slots > 0;
  }

  useSpellSlot(level: string): boolean {
    if (this.hasSpellSlot(level)) {
      this.spellSlots[level]--;
      return true;
    }
    return false;
  }

  restoreSpellSlot(level: string): void {
    if (this.spellSlots[level] !== undefined) {
      this.spellSlots[level]++;
    }
  }

  getClassName(language: 'en' | 'ru' = 'en'): string {
    return this.characterClass
      ? this.characterClass.getTitle(language)
      : 'Unknown';
  }

  getAvailableSpells(): Spell[] {
    if (!this.characterClass || !this.characterClass.spells) return [];

    return this.characterClass.spells.filter(
      (spell) => !this.hasSpell(spell.id),
    );
  }

  getAvailableSpellsByLevel(level: string): Spell[] {
    return this.getAvailableSpells().filter((spell) => spell.level === level);
  }
}
