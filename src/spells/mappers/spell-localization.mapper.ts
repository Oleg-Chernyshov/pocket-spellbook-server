import { LocalizedSpell } from '../interfaces/spell.interface';
import { Spell } from '../entities/spell.entity';
import { SpellTranslation } from '../entities/spell-translation.entity';

export const localizeSpell = (
  spell: Spell,
  translation: SpellTranslation,
): LocalizedSpell => ({
  id: spell.id,
  name: translation.name,
  level: spell.level,
  text: translation.text,
  school: translation.school,
  castingTime: translation.castingTime,
  range: translation.range,
  materials: translation.materials ?? '',
  components: translation.components,
  duration: translation.duration,
  source: translation.source,
  createdAt: translation.createdAt ?? spell.createdAt,
  updatedAt: translation.updatedAt ?? spell.updatedAt,
});

export const localizeSpells = (spells: Spell[]): LocalizedSpell[] =>
  spells
    .map((spell) => {
      const translation = spell.translations?.[0] ?? null;

      return translation ? localizeSpell(spell, translation) : null;
    })
    .filter((spell): spell is LocalizedSpell => spell !== null);
