import { Test, TestingModule } from '@nestjs/testing';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { SpellsService } from '../spells/spells.service';
import { CreateCharacterDto, UpdateCharacterDto } from './dto/character.dto';

describe('CharactersController', () => {
  let controller: CharactersController;
  let service: CharactersService;
  let spellsService: SpellsService;

  const mockCharactersService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addSpell: jest.fn(),
    removeSpell: jest.fn(),
  };

  const mockSpellsService = {
    getCharacterSpells: jest.fn(),
  };

  type ReqType = Parameters<CharactersController['create']>[1];
  const mockReq = (userId: number): ReqType =>
    ({ user: { id: userId, email: 'u@e.com' } }) as unknown as ReqType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CharactersController],
      providers: [
        { provide: CharactersService, useValue: mockCharactersService },
        { provide: SpellsService, useValue: mockSpellsService },
      ],
    }).compile();

    controller = module.get<CharactersController>(CharactersController);
    service = module.get<CharactersService>(CharactersService);
    spellsService = module.get<SpellsService>(SpellsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create character for current user', async () => {
      const dto: CreateCharacterDto = {
        name: 'Gandalf',
        characterClassId: 1,
        spellSlots: { '1': 2 },
      };
      const created = { id: 1, ...dto };
      (service.create as jest.Mock).mockResolvedValue(created);

      const result = await controller.create(dto, mockReq(10));
      expect(result).toEqual({
        ...created,
        message: 'Персонаж успешно создан',
      });
      expect(service.create).toHaveBeenCalledWith(dto, 10);
    });
  });

  describe('findAll', () => {
    it('should return characters for user', async () => {
      const list = [{ id: 1 }];
      (service.findAllByUser as jest.Mock).mockResolvedValue(list);

      const result = await controller.findAll(mockReq(10));
      expect(result).toEqual(list);
      expect(service.findAllByUser).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return character by id', async () => {
      const entity = { id: 1 };
      (service.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await controller.findOne('1', mockReq(10));
      expect(result).toEqual(entity);
      expect(service.findOne).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('update', () => {
    it('should update character', async () => {
      const updated = { id: 1, name: 'New' };
      (service.update as jest.Mock).mockResolvedValue(updated);

      const updateDto: UpdateCharacterDto = { name: 'New' };
      const result = await controller.update('1', updateDto, mockReq(10));
      expect(result).toEqual({
        ...updated,
        message: 'Персонаж успешно обновлен',
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto, 10);
    });
  });

  describe('remove', () => {
    it('should remove character', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);
      const result = await controller.remove('1', mockReq(10));
      expect(result).toEqual({ message: 'Персонаж успешно удален' });
      expect(service.remove).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('getCharacterSpells', () => {
    it('should return localized spells of character with default language', async () => {
      (service.findOne as jest.Mock).mockResolvedValue({
        id: 1,
      });
      (spellsService.getCharacterSpells as jest.Mock).mockResolvedValue([
        { id: 5 },
      ]);

      const result = await controller.getCharacterSpells('1', mockReq(10));

      expect(service.findOne).toHaveBeenCalledWith(1, 10);
      expect(spellsService.getCharacterSpells).toHaveBeenCalledWith(1, 'en');
      expect(result).toEqual([{ id: 5 }]);
    });

    it('should pass language to spells service', async () => {
      (service.findOne as jest.Mock).mockResolvedValue({
        id: 2,
      });
      (spellsService.getCharacterSpells as jest.Mock).mockResolvedValue([
        { id: 7 },
      ]);

      const result = await controller.getCharacterSpells(
        '2',
        mockReq(10),
        'ru',
      );

      expect(service.findOne).toHaveBeenCalledWith(2, 10);
      expect(spellsService.getCharacterSpells).toHaveBeenCalledWith(2, 'ru');
      expect(result).toEqual([{ id: 7 }]);
    });
  });

  describe('learnSpell', () => {
    it('should learn a spell', async () => {
      const character = { id: 1 };
      (service.addSpell as jest.Mock).mockResolvedValue(character);

      const result = await controller.learnSpell('1', '5', mockReq(10));
      expect(result).toEqual({
        message: `Заклинание успешно изучено`,
        character,
      });
      expect(service.addSpell).toHaveBeenCalledWith(1, { spellId: 5 }, 10);
    });
  });

  describe('forgetSpell', () => {
    it('should forget a spell', async () => {
      const character = { id: 1 };
      (service.removeSpell as jest.Mock).mockResolvedValue(character);

      const result = await controller.forgetSpell('1', '5', mockReq(10));
      expect(result).toEqual({
        message: `Заклинание успешно забыто`,
        character,
      });
      expect(service.removeSpell).toHaveBeenCalledWith(1, 5, 10);
    });
  });
});
