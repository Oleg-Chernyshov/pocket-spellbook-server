export interface SpellSlot {
  level: number;
  count: number;
}

export interface Character {
  id?: number;
  name: string;
  userId: number;
  spellSlots: SpellSlot[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CharacterCreateDto {
  name: string;
  spellSlots: SpellSlot[];
}

export interface CharacterSpell {
  id?: number;
  characterId: number;
  spellId: number;
  createdAt?: Date;
}
