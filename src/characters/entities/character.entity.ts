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
}
