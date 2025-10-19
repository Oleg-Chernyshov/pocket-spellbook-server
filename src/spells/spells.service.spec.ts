import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpellsService } from './spells.service';
import { Spell } from './entities/spell.entity';
import { CharacterClass } from './entities/character-class.entity';

interface MockQueryBuilder {
  andWhere: jest.Mock;
  where: jest.Mock;
  getMany: jest.Mock;
  getCount: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  orderBy: jest.Mock;
  innerJoin: jest.Mock;
  addOrderBy: jest.Mock;
  insert: jest.Mock;
  delete: jest.Mock;
}

describe('SpellsService', () => {
  let service: SpellsService;

  let mockQueryBuilder: MockQueryBuilder;

  const mockSpell: Spell = {
    id: 1,
    nameEn: 'Acid Splash',
    nameRu: 'Кислотные брызги',
    level: '0',
    textEn: 'English text',
    textRu: 'Русский текст',
    schoolEn: 'Conjuration',
    schoolRu: 'призыв',
    castingTimeEn: '1 action',
    castingTimeRu: '1 действие',
    rangeEn: '60 feet',
    rangeRu: '60 футов',
    materialsEn: '',
    materialsRu: '',
    componentsEn: 'V, S',
    componentsRu: 'В, С',
    durationEn: 'Instantaneous',
    durationRu: 'мгновенно',
    sourceEn: 'PHB',
    sourceRu: 'PHB',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as Spell;

  const mockSpells: Spell[] = [
    mockSpell,
    {
      ...mockSpell,
      id: 2,
      nameEn: 'Fireball',
      nameRu: 'Огненный шар',
      level: '3',
      schoolEn: 'Evocation',
      schoolRu: 'воплощение',
    } as Spell,
  ];

  const mockCharacterClass: CharacterClass = {
    id: 1,
    titleEn: 'Artificer',
    titleRu: 'Изобретатель',
    spells: mockSpells,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as CharacterClass;

  const mockSpellRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockCharacterClassRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    mockSpellRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockSpellRepository.findOne.mockResolvedValue(null);
    mockCharacterClassRepository.findOne.mockResolvedValue(null);
    mockCharacterClassRepository.createQueryBuilder.mockReturnValue(
      mockQueryBuilder,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpellsService,
        {
          provide: getRepositoryToken(Spell),
          useValue: mockSpellRepository,
        },
        {
          provide: getRepositoryToken(CharacterClass),
          useValue: mockCharacterClassRepository,
        },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all spells when no filters provided', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);
      mockQueryBuilder.getCount.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Acid Splash');
      expect(result.data[1].name).toBe('Fireball');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should filter by level', async () => {
      const level3Spells = mockSpells.filter((s) => s.level === '3');
      mockQueryBuilder.getMany.mockResolvedValue(level3Spells);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAll({ level: '3' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].level).toBe('3');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'spell.level = :level',
        { level: '3' },
      );
    });

    it('should filter by school in English', async () => {
      const conjurationSpells = mockSpells.filter(
        (s) => s.schoolEn === 'Conjuration',
      );
      mockQueryBuilder.getMany.mockResolvedValue(conjurationSpells);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAll({
        school: 'Conjuration',
        language: 'en',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].school).toBe('Conjuration');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'spell.schoolEn = :school',
        { school: 'Conjuration' },
      );
    });

    it('should filter by school in Russian', async () => {
      const conjurationSpells = mockSpells.filter(
        (s) => s.schoolRu === 'призыв',
      );
      mockQueryBuilder.getMany.mockResolvedValue(conjurationSpells);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAll({
        school: 'призыв',
        language: 'ru',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].school).toBe('призыв');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'spell.schoolRu = :school',
        { school: 'призыв' },
      );
    });

    it('should filter by search term in English', async () => {
      const searchResults = mockSpells.filter((s) => s.nameEn.includes('Acid'));
      mockQueryBuilder.getMany.mockResolvedValue(searchResults);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAll({ search: 'Acid', language: 'en' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Acid Splash');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'MATCH(spell.name_en, spell.text_en) AGAINST(:search IN BOOLEAN MODE)',
        { search: 'Acid*' },
      );
    });

    it('should filter by search term in Russian', async () => {
      const searchResults = mockSpells.filter((s) =>
        s.nameRu.includes('Огненный'),
      );
      mockQueryBuilder.getMany.mockResolvedValue(searchResults);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAll({
        search: 'Огненный',
        language: 'ru',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Огненный шар');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'MATCH(spell.name_ru, spell.text_ru) AGAINST(:search IN BOOLEAN MODE)',
        { search: 'Огненный*' },
      );
    });

    it('should filter by character class', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);
      mockQueryBuilder.getCount.mockResolvedValue(2);

      const result = await service.findAll({ characterClass: 1 });

      expect(result.data).toHaveLength(2);
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'character_class_spells',
        'ccs',
        'ccs.spell_id = spell.id',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ccs.character_class_id = :classId',
        { classId: 1 },
      );
    });

    it('should handle character class with no spells', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.findAll({ characterClass: 999 });

      expect(result.data).toHaveLength(0);
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalled();
    });

    it('should handle non-existent character class', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.findAll({
        characterClass: 9999,
      });

      expect(result.data).toHaveLength(0);
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalled();
    });

    it('should combine multiple filters', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockSpells[0]]);
      mockQueryBuilder.getCount.mockResolvedValue(1);

      const result = await service.findAll({
        level: '0',
        school: 'Conjuration',
        language: 'en',
      });

      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'spell.level = :level',
        { level: '0' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'spell.schoolEn = :school',
        { school: 'Conjuration' },
      );
    });

    it('should use English as default language', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);

      const result = await service.findAll();

      expect(result.data[0].name).toBe('Acid Splash');
      expect(result.data[0].school).toBe('Conjuration');
    });
  });

  describe('pagination', () => {
    it('should return paginated results with default values', async () => {
      const mockSpells = [
        {
          id: 1,
          nameEn: 'Acid Splash',
          nameRu: 'Кислотные брызги',
          level: '0',
          textEn: 'English text',
          textRu: 'Русский текст',
          schoolEn: 'Conjuration',
          schoolRu: 'призыв',
          castingTimeEn: '1 action',
          castingTimeRu: '1 действие',
          rangeEn: '60 feet',
          rangeRu: '60 футов',
          materialsEn: '',
          materialsRu: '',
          componentsEn: 'V, S',
          componentsRu: 'В, С',
          durationEn: 'Instantaneous',
          durationRu: 'мгновенно',
          sourceEn: 'PHB',
          sourceRu: 'PHB',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          nameEn: 'Fireball',
          nameRu: 'Огненный шар',
          level: '3',
          textEn: 'English text',
          textRu: 'Русский текст',
          schoolEn: 'Evocation',
          schoolRu: 'воплощение',
          castingTimeEn: '1 action',
          castingTimeRu: '1 действие',
          rangeEn: '60 feet',
          rangeRu: '60 футов',
          materialsEn: '',
          materialsRu: '',
          componentsEn: 'V, S',
          componentsRu: 'В, С',
          durationEn: 'Instantaneous',
          durationRu: 'мгновенно',
          sourceEn: 'PHB',
          sourceRu: 'PHB',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);
      mockQueryBuilder.getCount.mockResolvedValue(100);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return paginated results with custom page and limit', async () => {
      const mockSpells = [
        {
          id: 3,
          nameEn: 'Lightning Bolt',
          nameRu: 'Молния',
          level: '3',
          textEn: 'English text',
          textRu: 'Русский текст',
          schoolEn: 'Evocation',
          schoolRu: 'воплощение',
          castingTimeEn: '1 action',
          castingTimeRu: '1 действие',
          rangeEn: '120 feet',
          rangeRu: '120 футов',
          materialsEn: '',
          materialsRu: '',
          componentsEn: 'V, S',
          componentsRu: 'В, С',
          durationEn: 'Instantaneous',
          durationRu: 'мгновенно',
          sourceEn: 'PHB',
          sourceRu: 'PHB',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);
      mockQueryBuilder.getCount.mockResolvedValue(50);

      const result = await service.findAll({ page: 3, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle last page correctly', async () => {
      const mockSpells = [
        {
          id: 99,
          nameEn: 'Wish',
          nameRu: 'Желание',
          level: '9',
          textEn: 'English text',
          textRu: 'Русский текст',
          schoolEn: 'Evocation',
          schoolRu: 'воплощение',
          castingTimeEn: '1 action',
          castingTimeRu: '1 действие',
          rangeEn: 'Self',
          rangeRu: 'Само',
          materialsEn: '',
          materialsRu: '',
          componentsEn: 'V, S, M',
          componentsRu: 'В, С, М',
          durationEn: 'Instantaneous',
          durationRu: 'мгновенно',
          sourceEn: 'PHB',
          sourceRu: 'PHB',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);
      mockQueryBuilder.getCount.mockResolvedValue(100);

      const result = await service.findAll({ page: 5, limit: 20 });

      expect(result.pagination).toEqual({
        page: 5,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe('count', () => {
    it('should return total count of spells', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(150);

      const result = await service.count();

      expect(result).toBe(150);
    });

    it('should return count with filters applied', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(25);

      const result = await service.count({ level: '1', school: 'Evocation' });

      expect(result).toBe(25);
    });

    it('should return count with character class filter', async () => {
      mockCharacterClassRepository.findOne.mockResolvedValue(
        mockCharacterClass,
      );
      mockQueryBuilder.getCount.mockResolvedValue(10);

      const result = await service.count({ characterClass: 1 });

      expect(result).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a localized spell by id in English', async () => {
      mockSpellRepository.findOne.mockResolvedValue(mockSpell);

      const result = await service.findOne(1, 'en');

      expect(result).toEqual({
        id: 1,
        name: 'Acid Splash',
        level: '0',
        text: 'English text',
        school: 'Conjuration',
        castingTime: '1 action',
        range: '60 feet',
        materials: '',
        components: 'V, S',
        duration: 'Instantaneous',
        source: 'PHB',
        createdAt: mockSpell.createdAt,
        updatedAt: mockSpell.updatedAt,
      });
      expect(mockSpellRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return a localized spell by id in Russian', async () => {
      mockSpellRepository.findOne.mockResolvedValue(mockSpell);

      const result = await service.findOne(1, 'ru');

      expect(result).toEqual({
        id: 1,
        name: 'Кислотные брызги',
        level: '0',
        text: 'Русский текст',
        school: 'призыв',
        castingTime: '1 действие',
        range: '60 футов',
        materials: '',
        components: 'В, С',
        duration: 'мгновенно',
        source: 'PHB',
        createdAt: mockSpell.createdAt,
        updatedAt: mockSpell.updatedAt,
      });
    });

    it('should return null for non-existent spell', async () => {
      mockSpellRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(mockSpellRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should use English as default language', async () => {
      mockSpellRepository.findOne.mockResolvedValue(mockSpell);

      const result = await service.findOne(1);

      expect(result?.name).toBe('Acid Splash');
      expect(result?.school).toBe('Conjuration');
    });
  });

  describe('addSpellToClass', () => {
    it('should add spell to class successfully', async () => {
      mockCharacterClassRepository.findOne.mockResolvedValue(
        mockCharacterClass,
      );
      mockSpellRepository.findOne.mockResolvedValue(mockSpell);
      mockQueryBuilder.insert.mockReturnValue({
        into: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
          }),
        }),
      });

      const result = await service.addSpellToClass(1, 1);

      expect(result).toBe(true);
    });

    it('should return false when class not found', async () => {
      mockCharacterClassRepository.findOne.mockResolvedValue(null);

      const result = await service.addSpellToClass(999, 1);

      expect(result).toBe(false);
    });

    it('should return false when spell not found', async () => {
      mockCharacterClassRepository.findOne.mockResolvedValue(
        mockCharacterClass,
      );
      mockSpellRepository.findOne.mockResolvedValue(null);

      const result = await service.addSpellToClass(1, 999);

      expect(result).toBe(false);
    });
  });

  describe('removeSpellFromClass', () => {
    it('should remove spell from class successfully', async () => {
      mockQueryBuilder.delete.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
          }),
        }),
      });

      const result = await service.removeSpellFromClass(1, 1);

      expect(result).toBe(true);
    });

    it('should return false when spell not found in class', async () => {
      mockQueryBuilder.delete.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue({ affected: 0 }),
          }),
        }),
      });

      const result = await service.removeSpellFromClass(1, 999);

      expect(result).toBe(false);
    });
  });

  describe('getClassSpellsStats', () => {
    it('should return statistics for class spells', async () => {
      mockQueryBuilder.getMany.mockResolvedValue(mockSpells);

      const result = await service.getClassSpellsStats(1);

      expect(result.total).toBe(2);
      expect(result.byLevel['0']).toBe(1);
      expect(result.byLevel['3']).toBe(1);
      expect(result.bySchool['Conjuration']).toBe(1);
      expect(result.bySchool['Evocation']).toBe(1);
    });

    it('should return empty stats when class has no spells', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getClassSpellsStats(1);

      expect(result.total).toBe(0);
      expect(result.byLevel).toEqual({});
      expect(result.bySchool).toEqual({});
    });
  });

  describe('localizeSpell (private method)', () => {
    it('should correctly localize spell to English', async () => {
      mockSpellRepository.findOne.mockResolvedValue(mockSpell);

      const result = await service.findOne(1, 'en');

      expect(result?.name).toBe('Acid Splash');
      expect(result?.school).toBe('Conjuration');
      expect(result?.text).toBe('English text');
    });

    it('should correctly localize spell to Russian', async () => {
      mockSpellRepository.findOne.mockResolvedValue(mockSpell);

      const result = await service.findOne(1, 'ru');

      expect(result?.name).toBe('Кислотные брызги');
      expect(result?.school).toBe('призыв');
      expect(result?.text).toBe('Русский текст');
    });
  });

  describe('getAllCharacterClasses', () => {
    it('should return all character classes in English', async () => {
      const mockClasses = [
        {
          id: 1,
          titleEn: 'Artificer',
          titleRu: 'Изобретатель',
          hasSpells: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          titleEn: 'Bard',
          titleRu: 'Бард',
          hasSpells: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCharacterClassRepository.find.mockResolvedValue(mockClasses);

      const result = await service.getAllCharacterClasses('en');

      expect(result).toEqual([
        {
          id: 1,
          title: 'Artificer',
          titleEn: 'Artificer',
          titleRu: 'Изобретатель',
          hasSpells: 1,
        },
        {
          id: 2,
          title: 'Bard',
          titleEn: 'Bard',
          titleRu: 'Бард',
          hasSpells: 1,
        },
      ]);
      expect(mockCharacterClassRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' },
      });
    });

    it('should return all character classes in Russian', async () => {
      const mockClasses = [
        {
          id: 1,
          titleEn: 'Artificer',
          titleRu: 'Изобретатель',
          hasSpells: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          titleEn: 'Wizard',
          titleRu: 'Волшебник',
          hasSpells: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCharacterClassRepository.find.mockResolvedValue(mockClasses);

      const result = await service.getAllCharacterClasses('ru');

      expect(result).toEqual([
        {
          id: 1,
          title: 'Изобретатель',
          titleEn: 'Artificer',
          titleRu: 'Изобретатель',
          hasSpells: 1,
        },
        {
          id: 9,
          title: 'Волшебник',
          titleEn: 'Wizard',
          titleRu: 'Волшебник',
          hasSpells: 1,
        },
      ]);
    });

    it('should return classes in English by default', async () => {
      const mockClasses = [
        {
          id: 1,
          titleEn: 'Artificer',
          titleRu: 'Изобретатель',
          hasSpells: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCharacterClassRepository.find.mockResolvedValue(mockClasses);

      const result = await service.getAllCharacterClasses();

      expect(result[0].title).toBe('Artificer');
      expect(result[0].hasSpells).toBe(1);
    });
  });
});
