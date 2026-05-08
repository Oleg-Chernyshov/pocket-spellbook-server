import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CharacterSpellsService } from '../../../src/spells/services/character-spells.service';
import { Spell } from '../../../src/spells/entities/spell.entity';

describe('CharacterSpellsService', () => {
  let service: CharacterSpellsService;

  const queryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const spellsRepository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharacterSpellsService,
        {
          provide: getRepositoryToken(Spell),
          useValue: spellsRepository,
        },
      ],
    }).compile();

    service = module.get<CharacterSpellsService>(CharacterSpellsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns localized spells learned by a character', async () => {
    queryBuilder.getMany.mockResolvedValue([
      {
        id: 1,
        level: '3',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        translations: [
          {
            name: 'Fireball',
            text: 'English text',
            school: 'Evocation',
            castingTime: '1 action',
            range: '150 feet',
            materials: '',
            components: 'V, S, M',
            duration: 'Instantaneous',
            source: 'PHB',
          },
        ],
      },
    ]);

    const result = await service.findByCharacter(10, 'en');

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'cs.character_id = :characterId',
      { characterId: 10 },
    );
    expect(result).toEqual([
      expect.objectContaining({
        id: 1,
        name: 'Fireball',
        school: 'Evocation',
      }),
    ]);
  });
});
