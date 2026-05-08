import { Spell } from '../entities/spell.entity';

export interface SpellStats {
  total: number;
  byLevel: Record<string, number>;
  bySchool: Record<string, number>;
}

export const buildSpellStats = (spells: Spell[]): SpellStats => {
  const byLevel: Record<string, number> = {};
  const bySchool: Record<string, number> = {};

  spells.forEach((spell) => {
    byLevel[spell.level] = (byLevel[spell.level] || 0) + 1;

    const school = spell.translations?.[0]?.school;
    if (school) {
      bySchool[school] = (bySchool[school] || 0) + 1;
    }
  });

  return {
    total: spells.length,
    byLevel,
    bySchool,
  };
};
