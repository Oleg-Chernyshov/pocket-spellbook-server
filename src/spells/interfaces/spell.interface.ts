export interface SpellLocalization {
  name: string;
  level: string;
  text: string;
  school: string;
  castingTime: string;
  range: string;
  materials: string;
  components: string;
  duration: string;
  source: string;
}

export interface Spell {
  id?: number;
  nameEn: string;
  level: string;
  textEn: string;
  schoolEn: string;
  castingTimeEn: string;
  rangeEn: string;
  materialsEn: string;
  componentsEn: string;
  durationEn: string;
  sourceEn: string;
  nameRu: string;
  textRu: string;
  schoolRu: string;
  castingTimeRu: string;
  rangeRu: string;
  materialsRu: string;
  componentsRu: string;
  durationRu: string;
  sourceRu: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocalizedSpell {
  id: number;
  name: string;
  level: string;
  text: string;
  school: string;
  castingTime: string;
  range: string;
  materials: string;
  components: string;
  duration: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpellFilter {
  level?: string;
  school?: string;
  source?: string;
  search?: string;
  language?: 'en' | 'ru';
  characterClass?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedSpellsResponse {
  data: LocalizedSpell[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
