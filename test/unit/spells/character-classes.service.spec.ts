import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CharacterClassesService } from '../../../src/spells/services/character-classes.service';
import { CharacterClass } from '../../../src/spells/entities/character-class.entity';
import { Spell } from '../../../src/spells/entities/spell.entity';

describe('CharacterClassesService', () => {
  let service: CharacterClassesService;

  const characterClassRepository = {
    find: jest.fn(),
  };

  const queryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const spellsRepository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterClassesService,
        {
          provide: getRepositoryToken(CharacterClass),
          useValue: characterClassRepository,
        },
        {
          provide: getRepositoryToken(Spell),
          useValue: spellsRepository,
        },
      ],
    }).compile();

    service = module.get<CharacterClassesService>(CharacterClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns localized class titles', async () => {
    characterClassRepository.find.mockResolvedValue([
      {
        id: 1,
        titleEn: 'Wizard',
        titleRu: 'Волшебник',
        hasSpells: 1,
      },
    ]);

    await expect(service.findAll('ru')).resolves.toEqual([
      {
        id: 1,
        title: 'Волшебник',
        titleEn: 'Wizard',
        titleRu: 'Волшебник',
        hasSpells: 1,
      },
    ]);
  });

  it('returns spell stats for class spells', async () => {
    queryBuilder.getMany.mockResolvedValue([
      {
        level: '0',
        translations: [{ school: 'Conjuration' }],
      },
      {
        level: '3',
        translations: [{ school: 'Evocation' }],
      },
    ]);

    await expect(service.getSpellStats(1, 'ru')).resolves.toEqual({
      total: 2,
      byLevel: {
        '0': 1,
        '3': 1,
      },
      bySchool: {
        Conjuration: 1,
        Evocation: 1,
      },
    });
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'spell.translations',
      'translation',
      'translation.language = :language',
      { language: 'ru' },
    );
  });
});
