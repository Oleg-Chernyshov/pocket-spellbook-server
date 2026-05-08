import { Test, TestingModule } from '@nestjs/testing';
import { SpellsController } from '../../../src/spells/spells.controller';
import { SpellsService } from '../../../src/spells/spells.service';
import { CharacterClassesService } from '../../../src/spells/services/character-classes.service';
import {
  LocalizedSpell,
  PaginatedSpellsResponse,
} from '../../../src/spells/interfaces/spell.interface';

describe('SpellsController', () => {
  let controller: SpellsController;
  let service: SpellsService;
  let characterClassesService: CharacterClassesService;

  const mockSpellsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCharacterClassesService = {
    findAll: jest.fn(),
    getSpellStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpellsController],
      providers: [
        {
          provide: SpellsService,
          useValue: mockSpellsService,
        },
        {
          provide: CharacterClassesService,
          useValue: mockCharacterClassesService,
        },
      ],
    }).compile();

    controller = module.get<SpellsController>(SpellsController);
    service = module.get<SpellsService>(SpellsService);
    characterClassesService = module.get<CharacterClassesService>(
      CharacterClassesService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all spells with filters', async () => {
      const filters = { level: '1', school: 'Conjuration' };
      const expectedSpells: PaginatedSpellsResponse = {
        data: [
          {
            id: 1,
            name: 'Acid Splash',
            level: '1',
            text: 'Test spell',
            school: 'Conjuration',
            castingTime: '1 action',
            range: '60 feet',
            materials: '',
            components: 'V, S',
            duration: 'Instantaneous',
            source: 'PHB',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedSpells);

      const result = await controller.findAll(filters);
      expect(result).toEqual(expectedSpells);
      expect(service.findAll).toHaveBeenCalledWith(filters);
    });

    it('should return all spells without filters', async () => {
      const expectedSpells: PaginatedSpellsResponse = {
        data: [
          {
            id: 1,
            name: 'Acid Splash',
            level: '0',
            text: 'Test spell',
            school: 'Conjuration',
            castingTime: '1 action',
            range: '60 feet',
            materials: '',
            components: 'V, S',
            duration: 'Instantaneous',
            source: 'PHB',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedSpells);

      const result = await controller.findAll({});
      expect(result).toEqual(expectedSpells);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a spell by id with default language', async () => {
      const spellId = '1';
      const expectedSpell: LocalizedSpell = {
        id: 1,
        name: 'Acid Splash',
        level: '0',
        text: 'Test spell',
        school: 'Conjuration',
        castingTime: '1 action',
        range: '60 feet',
        materials: '',
        components: 'V, S',
        duration: 'Instantaneous',
        source: 'PHB',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedSpell);

      const result = await controller.findOne(spellId);
      expect(result).toEqual(expectedSpell);
      expect(service.findOne).toHaveBeenCalledWith(1, undefined);
    });

    it('should return a spell by id with Russian language', async () => {
      const spellId = '1';
      const language = 'ru';
      const expectedSpell: LocalizedSpell = {
        id: 1,
        name: 'Кислотные брызги',
        level: '0',
        text: 'Тестовое заклинание',
        school: 'призыв',
        castingTime: '1 действие',
        range: '60 футов',
        materials: '',
        components: 'В, С',
        duration: 'мгновенно',
        source: 'PHB',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedSpell);

      const result = await controller.findOne(spellId, language);
      expect(result).toEqual(expectedSpell);
      expect(service.findOne).toHaveBeenCalledWith(1, 'ru');
    });
  });

  describe('getAllCharacterClasses', () => {
    it('should return character classes from character class service', async () => {
      const classes = [{ id: 1, title: 'Wizard' }];
      jest.spyOn(characterClassesService, 'findAll').mockResolvedValue(classes);

      const result = await controller.getAllCharacterClasses('en');

      expect(result).toEqual(classes);
      expect(characterClassesService.findAll).toHaveBeenCalledWith('en');
    });
  });

  describe('getClassSpellsStats', () => {
    it('should return spell stats from character class service', async () => {
      const stats = { total: 1, byLevel: { '3': 1 }, bySchool: {} };
      jest
        .spyOn(characterClassesService, 'getSpellStats')
        .mockResolvedValue(stats);

      const result = await controller.getClassSpellsStats('1', 'ru');

      expect(result).toEqual(stats);
      expect(characterClassesService.getSpellStats).toHaveBeenCalledWith(
        1,
        'ru',
      );
    });
  });
});
