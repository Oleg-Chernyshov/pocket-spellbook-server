import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { Spell } from '../spells/entities/spell.entity';
import { NotFoundException } from '@nestjs/common';

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
  };

  const mockSpellsRepository = {
    findOne: jest.fn(),
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
    nameEn: 'Fireball',
    nameRu: 'Огненный шар',
    level: '3',
    textEn: 't',
    textRu: 't',
    schoolEn: 'Evocation',
    schoolRu: 'воплощение',
    castingTimeEn: '1 action',
    castingTimeRu: '1 действие',
    rangeEn: '150 feet',
    rangeRu: '150 футов',
    materialsEn: '',
    materialsRu: '',
    componentsEn: 'V,S,M',
    componentsRu: 'В,С,М',
    durationEn: 'Instant',
    durationRu: 'Мгновенно',
    sourceEn: 'PHB',
    sourceRu: 'PHB',
    createdAt: new Date(),
    updatedAt: new Date(),
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
      ],
    }).compile();

    service = module.get<CharactersService>(CharactersService);
    charactersRepository = module.get<Repository<Character>>(
      getRepositoryToken(Character),
    );
    spellsRepository = module.get<Repository<Spell>>(getRepositoryToken(Spell));

    jest.clearAllMocks();
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
  });

  describe('findAllByUser', () => {
    it('should find characters by userId with spells relation', async () => {
      const list = [mockCharacter()];
      (charactersRepository.find as jest.Mock).mockResolvedValue(list);

      const result = await service.findAllByUser(10);
      expect(result).toEqual(list);
      expect(charactersRepository.find).toHaveBeenCalledWith({
        where: { userId: 10 },
        relations: ['spells'],
      });
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
