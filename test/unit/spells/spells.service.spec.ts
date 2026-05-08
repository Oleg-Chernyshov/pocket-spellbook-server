import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SpellsService } from '../../../src/spells/spells.service';
import { Spell } from '../../../src/spells/entities/spell.entity';
import { SpellTranslation } from '../../../src/spells/entities/spell-translation.entity';

const translation = (
  overrides: Partial<SpellTranslation> = {},
): SpellTranslation =>
  ({
    id: 1,
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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as SpellTranslation;

const spell = (overrides: Partial<Spell> = {}): Spell =>
  ({
    id: 1,
    level: '0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    translations: [translation()],
    ...overrides,
  }) as Spell;

describe('SpellsService', () => {
  let service: SpellsService;
  let queryBuilder: {
    andWhere: jest.Mock;
    innerJoin: jest.Mock;
    innerJoinAndSelect: jest.Mock;
    getManyAndCount: jest.Mock;
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
  };

  const spellsRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    manager: {
      connection: {
        options: {
          type: 'mysql',
        },
      },
    },
  };

  beforeEach(async () => {
    queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
    };

    spellsRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    spellsRepository.findOne.mockResolvedValue(null);
    spellsRepository.manager.connection.options.type = 'mysql';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpellsService,
        {
          provide: getRepositoryToken(Spell),
          useValue: spellsRepository,
        },
      ],
    }).compile();

    service = module.get<SpellsService>(SpellsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns localized paginated spells', async () => {
    const spells = [
      spell(),
      spell({
        id: 2,
        level: '3',
        translations: [translation({ name: 'Fireball', school: 'Evocation' })],
      }),
    ];
    queryBuilder.getManyAndCount.mockResolvedValue([spells, 2]);

    const result = await service.findAll();

    expect(result.data).toEqual([
      expect.objectContaining({ id: 1, name: 'Acid Splash' }),
      expect.objectContaining({ id: 2, name: 'Fireball' }),
    ]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('applies filters to the query builder', async () => {
    await service.findAll({
      level: '3',
      school: 'Evocation',
      source: 'PHB',
      characterClass: 1,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith('spell.level = :level', {
      level: '3',
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'translation.school = :school',
      { school: 'Evocation' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'translation.source = :source',
      { source: 'PHB' },
    );
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'character_class_spells',
      'ccs',
      'ccs.spell_id = spell.id',
    );
  });

  it('uses MySQL full text search in MySQL-like databases', async () => {
    await service.findAll({ search: 'Acid' });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'MATCH(translation.name, translation.text) AGAINST(:search IN BOOLEAN MODE)',
      { search: 'Acid*' },
    );
  });

  it('uses LIKE search outside MySQL-like databases', async () => {
    spellsRepository.manager.connection.options.type = 'sqlite';

    await service.findAll({ search: 'Acid' });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(LOWER(translation.name) LIKE LOWER(:search) OR LOWER(translation.text) LIKE LOWER(:search))',
      { search: '%Acid%' },
    );
  });

  it('returns localized spell by id', async () => {
    spellsRepository.findOne.mockResolvedValue(
      spell({
        translations: [
          translation(),
          translation({
            id: 2,
            language: 'ru',
            name: 'Кислотные брызги',
            text: 'Русский текст',
            school: 'призыв',
          }),
        ],
      }),
    );

    const result = await service.findOne(1, 'ru');

    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'Кислотные брызги',
        school: 'призыв',
      }),
    );
  });

  it('returns null when spell is missing', async () => {
    spellsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).resolves.toBeNull();
  });
});
