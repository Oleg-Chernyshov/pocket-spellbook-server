import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('spells')
@Index('ft_spells_name_text_en', ['nameEn', 'textEn'], { fulltext: true })
@Index('ft_spells_name_text_ru', ['nameRu', 'textRu'], { fulltext: true })
export class Spell {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'level' })
  level: string;

  @Column('text', { name: 'text_en' })
  textEn: string;

  @Column({ name: 'school_en' })
  schoolEn: string;

  @Column({ name: 'casting_time_en' })
  castingTimeEn: string;

  @Column({ name: 'range_en' })
  rangeEn: string;

  @Column({ name: 'materials_en' })
  materialsEn: string;

  @Column({ name: 'components_en' })
  componentsEn: string;

  @Column({ name: 'duration_en' })
  durationEn: string;

  @Column({ name: 'source_en' })
  sourceEn: string;

  @Column({ name: 'name_ru' })
  nameRu: string;

  @Column('text', { name: 'text_ru' })
  textRu: string;

  @Column({ name: 'school_ru' })
  schoolRu: string;

  @Column({ name: 'casting_time_ru' })
  castingTimeRu: string;

  @Column({ name: 'range_ru' })
  rangeRu: string;

  @Column({ name: 'materials_ru' })
  materialsRu: string;

  @Column({ name: 'components_ru' })
  componentsRu: string;

  @Column({ name: 'duration_ru' })
  durationRu: string;

  @Column({ name: 'source_ru' })
  sourceRu: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
