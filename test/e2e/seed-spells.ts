import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Spell } from '../../src/spells/entities/spell.entity';
import { SpellTranslation } from '../../src/spells/entities/spell-translation.entity';
import { CharacterClass } from '../../src/spells/entities/character-class.entity';

export const seedSpells = async (app: INestApplication) => {
  const dataSource = app.get(DataSource);

  await dataSource.getRepository(Spell).save({
    id: 1,
    level: '0',
  });

  await dataSource.getRepository(SpellTranslation).save([
    {
      spellId: 1,
      language: 'en',
      name: 'Acid Splash',
      text: 'English text',
      school: 'Conjuration',
      castingTime: '1 action',
      range: '60 feet',
      materials: '',
      components: 'V, S',
      duration: 'Instantaneous',
      source: 'PHB',
    },
    {
      spellId: 1,
      language: 'ru',
      name: 'Кислотные брызги',
      text: 'Русский текст',
      school: 'призыв',
      castingTime: '1 действие',
      range: '60 футов',
      materials: '',
      components: 'В, С',
      duration: 'мгновенно',
      source: 'PHB',
    },
  ]);

  await dataSource.getRepository(CharacterClass).save({
    id: 1,
    titleEn: 'Wizard',
    titleRu: 'Волшебник',
    hasSpells: 1,
  });

  await dataSource
    .createQueryBuilder()
    .insert()
    .into('character_class_spells')
    .values({
      character_class_id: 1,
      spell_id: 1,
    })
    .execute();
};
