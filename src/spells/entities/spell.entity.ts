import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpellTranslation } from './spell-translation.entity';

@Entity('spells')
export class Spell {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'level', type: 'varchar', length: 10 })
  level: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => SpellTranslation, (translation) => translation.spell, {
    cascade: ['insert', 'update'],
  })
  translations: SpellTranslation[];
}
