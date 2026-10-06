import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '../../../src/characters/dto/character.dto';
import { CharactersService } from '../../../src/characters/characters.service';
import { Character } from '../../../src/characters/entities/character.entity';
import { Spell } from '../../../src/spells/entities/spell.entity';
import { SpellTranslation } from '../../../src/spells/entities/spell-translation.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('CharactersService', () => {
  let service: CharactersService;
  let charactersRepository: Repository<Character>;
  let spellsRepository: Repository<Spell>;

  const mockCharactersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSpellsRepository = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(10),
  };

  const mockCharacter = ({ withRelations = false } = {}): Character =>
    ({
      id: 1,
      name: 'Gandalf',
      userId: 10,
      characterClassId: 1,
      spellSlots: { '1': 2 },
      createdAt: new Date(),
      updatedAt: new Date(),
      spells: withRelations ? [] : undefined,
      characterClass: withRelations
        ? ({
            id: 1,
            spells: [],
            hasSpell: jest.fn().mockReturnValue(true),
          } as unknown as Character['characterClass'])
        : undefined,
      addSpell: jest.fn(function (this: Character, spell: Spell) {
        if (!this.spells) this.spells = [] as Spell[];
        this.spells.push(spell);
      }),
      removeSpell: jest.fn(function (this: Character, spellId: number) {
        if (!this.spells) return;
        this.spells = this.spells.filter((s) => s.id !== spellId);
      }),
      hasSpell: jest.fn(function (this: Character, spellId: number) {
        return (this.spells || []).some((s) => s.id === spellId);
      }),
    }) as unknown as Character;

  const mockSpell: Spell = {
    id: 5,
    level: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    translations: [
      {
        id: 1,
        spellId: 5,
        language: 'en',
        name: 'Fireball',
        text: 't',
        school: 'Evocation',
        castingTime: '1 action',
        range: '150 feet',
        materials: '',
        components: 'V,S,M',
        duration: 'Instant',
        source: 'PHB',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as SpellTranslation,
    ],
  } as Spell;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        {
          provide: getRepositoryToken(Character),
          useValue: mockCharactersRepository,
        },
        { provide: getRepositoryToken(Spell), useValue: mockSpellsRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    charactersRepository = module.get<Repository<Character>>(
      getRepositoryToken(Character),
    );
    spellsRepository = module.get<Repository<Spell>>(getRepositoryToken(Spell));

    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue(10);
    mockCharactersRepository.count.mockResolvedValue(0);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a character', async () => {
      const dto: CreateCharacterDto = {
        name: 'Gandalf',
        characterClassId: 1,
        spellSlots: { '1': 2 },
      };
      const created = { ...dto, id: 1, userId: 10 } as Character;

      (charactersRepository.create as jest.Mock).mockReturnValue(created);
      (charactersRepository.save as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto, 10);
      expect(result).toEqual(created);
      expect(charactersRepository.create).toHaveBeenCalledWith({
        ...dto,
        userId: 10,
      });
      expect(charactersRepository.save).toHaveBeenCalledWith(created);
    });

    it('should use empty spell slots by default', async () => {
      const dto: CreateCharacterDto = {
        name: 'Gandalf',
        characterClassId: 1,
      };
      const created = {
        ...dto,
        spellSlots: {},
        id: 1,
        userId: 10,
      } as Character;

      (charactersRepository.create as jest.Mock).mockReturnValue(created);
      (charactersRepository.save as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto, 10);

      expect(result.spellSlots).toEqual({});
      expect(charactersRepository.create).toHaveBeenCalledWith({
        ...dto,
        spellSlots: {},
        userId: 10,
      });
    });

    it('should throw ConflictException when the character limit is reached', async () => {
      mockCharactersRepository.count.mockResolvedValue(10);

      await expect(
        service.create({ name: 'Gandalf', characterClassId: 1 }, 10),
      ).rejects.toThrow(ConflictException);
      expect(charactersRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should find characters by userId with class relation and spellsCount', async () => {
      const list = [mockCharacter({ withRelations: true })];
      (charactersRepository.find as jest.Mock).mockResolvedValue(list);
      (charactersRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ id: 1, spellsCount: '4' }]),
      });

      const result = await service.findAllByUser(10);
      expect(result[0].spellsCount).toBe(4);
      expect(charactersRepository.find).toHaveBeenCalledWith({
        where: { userId: 10 },
        relations: ['characterClass'],
        order: { updatedAt: 'DESC' },
      });
    });

    it('should return an empty array without counting spells', async () => {
      (charactersRepository.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllByUser(10);
      expect(result).toEqual([]);
      expect(charactersRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return character when found', async () => {
      const entity = mockCharacter();
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await service.findOne(1, 10);
      expect(result).toBe(entity);
      expect(charactersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 10 },
        relations: ['spells'],
      });
    });

    it('should throw NotFoundException when not found', async () => {
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(1, 10)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSpell', () => {
    it('should add spell when eligible and not already known', async () => {
      const entity = mockCharacter({ withRelations: true });
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);
      (spellsRepository.findOne as jest.Mock).mockResolvedValue(mockSpell);
      (charactersRepository.save as jest.Mock).mockImplementation(
        (x: Character) => x,
      );

      const result = await service.addSpell(1, { spellId: mockSpell.id }, 10);

      expect(result.spells).toHaveLength(1);
      expect(entity.addSpell).toHaveBeenCalledWith(mockSpell);
      expect(charactersRepository.save).toHaveBeenCalledWith(entity);
    });

    it('should be idempotent if spell already learned', async () => {
      const entity = mockCharacter({ withRelations: true });
      entity.spells = [mockSpell];
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);
      (spellsRepository.findOne as jest.Mock).mockResolvedValue(mockSpell);

      const result = await service.addSpell(1, { spellId: mockSpell.id }, 10);
      expect(result.spells).toHaveLength(1);
      expect(charactersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if character not found', async () => {
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.addSpell(1, { spellId: 5 }, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if spell not found', async () => {
      const entity = mockCharacter({ withRelations: true });
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);
      (spellsRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.addSpell(1, { spellId: 999 }, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeSpell', () => {
    it('should remove spell and save character', async () => {
      const entity = mockCharacter({ withRelations: true });
      entity.spells = [mockSpell];
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);
      (charactersRepository.save as jest.Mock).mockImplementation(
        (x: Character) => x,
      );

      const result = await service.removeSpell(1, mockSpell.id, 10);
      expect(entity.removeSpell).toHaveBeenCalledWith(mockSpell.id);
      expect(result.spells).toHaveLength(0);
    });

    it('should be idempotent if character has no spells', async () => {
      const entity = mockCharacter({ withRelations: true });
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await service.removeSpell(1, mockSpell.id, 10);
      expect(result.spells).toEqual([]);
      expect(charactersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if character not found', async () => {
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.removeSpell(1, 1, 10)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should merge update fields and save', async () => {
      const entity = mockCharacter();
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);
      (charactersRepository.save as jest.Mock).mockImplementation(
        (x: Character) => x,
      );

      const updateDto: UpdateCharacterDto = { name: 'New' };
      const result = await service.update(1, updateDto, 10);
      expect(result.name).toBe('New');
      expect(charactersRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove character', async () => {
      const entity = mockCharacter();
      (charactersRepository.findOne as jest.Mock).mockResolvedValue(entity);
      (charactersRepository.remove as jest.Mock).mockResolvedValue(undefined);

      await service.remove(1, 10);
      expect(charactersRepository.remove).toHaveBeenCalledWith(entity);
    });
  });
});
