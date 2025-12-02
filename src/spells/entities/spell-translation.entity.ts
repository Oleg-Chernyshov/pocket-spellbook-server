import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Spell } from './spell.entity';

@Entity('spell_translations')
@Unique(['spellId', 'language'])
@Index('idx_spell_translations_language', ['language'])
export class SpellTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'spell_id' })
  spellId: number;

  @ManyToOne(() => Spell, (spell) => spell.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'spell_id' })
  spell: Spell;

  @Column({ name: 'language', type: 'varchar', length: 5 })
  language: 'en' | 'ru';

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'text', type: 'text' })
  text: string;

  @Column({ name: 'school', type: 'varchar', length: 100 })
  school: string;

  @Column({ name: 'casting_time', type: 'varchar', length: 100 })
  castingTime: string;

  @Column({ name: 'range', type: 'varchar', length: 100 })
  range: string;

  @Column({ name: 'materials', type: 'text', nullable: true })
  materials: string | null;

  @Column({ name: 'components', type: 'varchar', length: 100 })
  components: string;

  @Column({ name: 'duration', type: 'varchar', length: 100 })
  duration: string;

  @Column({ name: 'source', type: 'varchar', length: 50 })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}



