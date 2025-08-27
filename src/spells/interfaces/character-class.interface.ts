export interface CharacterClassLocalization {
  en: string;
  ru: string;
}

export interface CharacterClass {
  id?: number;
  titleEn: string;
  titleRu: string;
  spells: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
