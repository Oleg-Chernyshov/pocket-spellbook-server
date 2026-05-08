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
}
