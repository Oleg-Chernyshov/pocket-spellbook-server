import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { Spell } from '../spells/entities/spell.entity';
import {
  CreateCharacterDto,
  AddSpellToCharacterDto,
  UpdateCharacterDto,
} from './dto/character.dto';
import { CharacterClass } from '../spells/entities/character-class.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Spell)
    private spellsRepository: Repository<Spell>,
    private configService: ConfigService,
  ) {}

  async create(
    createCharacterDto: CreateCharacterDto,
    userId: number,
  ): Promise<Character> {
    const maxPerUser = this.configService.get<number>(
      'characters.maxPerUser',
      10,
    );
    const currentCount = await this.charactersRepository.count({
      where: { userId },
    });

    if (currentCount >= maxPerUser) {
      throw new ConflictException(
        `Достигнут лимит персонажей на аккаунт (${maxPerUser})`,
      );
    }

    const character = this.charactersRepository.create({
      ...createCharacterDto,
      spellSlots: createCharacterDto.spellSlots ?? {},
      userId,
    });

    return this.charactersRepository.save(character);
  }

  async findAllByUser(userId: number): Promise<Character[]> {
    const characters = await this.charactersRepository.find({
      where: { userId },
      relations: ['characterClass'],
      order: { updatedAt: 'DESC' },
    });

    if (characters.length === 0) {
      return [];
    }

    const ids = characters.map((character) => character.id);
    const counts = await this.charactersRepository
      .createQueryBuilder('character')
      .leftJoin('character.spells', 'spell')
      .select('character.id', 'id')
      .addSelect('COUNT(spell.id)', 'spellsCount')
      .where('character.id IN (:...ids)', { ids })
      .groupBy('character.id')
      .getRawMany<{ id: string | number; spellsCount: string | number }>();

    const countMap = new Map(
      counts.map((row) => [Number(row.id), Number(row.spellsCount)]),
    );

    return characters.map((character) => {
      character.spellsCount = countMap.get(character.id) ?? 0;
      character.characterClass = this.stripClassSpells(
        character.characterClass,
      );
      return character;
    });
  }

  async findOne(id: number, userId: number): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id, userId },
      relations: ['spells'],
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }

  async addSpell(
    characterId: number,
    addSpellDto: AddSpellToCharacterDto,
    userId: number,
  ): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id: characterId, userId },
      relations: ['spells'],
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    const spell = await this.getSpellById(addSpellDto.spellId);

    if (character.hasSpell(spell.id)) {
      return character;
    }

    character.addSpell(spell);

    return this.charactersRepository.save(character);
  }

  async removeSpell(
    characterId: number,
    spellId: number,
    userId: number,
  ): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id: characterId, userId },
      relations: ['spells'],
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (!character.spells || character.spells.length === 0) {
      return character;
    }

    character.removeSpell(spellId);
    return this.charactersRepository.save(character);
  }

  async update(
    id: number,
    updateCharacterDto: UpdateCharacterDto,
    userId: number,
  ): Promise<Character> {
    const character = await this.findOne(id, userId);

    Object.assign(character, updateCharacterDto);

    return this.charactersRepository.save(character);
  }

  async remove(id: number, userId: number): Promise<void> {
    const character = await this.findOne(id, userId);
    await this.charactersRepository.remove(character);
  }

  private stripClassSpells(
    characterClass?: CharacterClass | null,
  ): CharacterClass | undefined {
    if (!characterClass) {
      return characterClass ?? undefined;
    }

    const { spells: _spells, ...classWithoutSpells } =
      characterClass as CharacterClass & { spells?: unknown };
    void _spells;

    return classWithoutSpells as CharacterClass;
  }

  private async getSpellById(spellId: number): Promise<Spell> {
    const spell = await this.spellsRepository.findOne({
      where: { id: spellId },
    });

    if (!spell) {
      throw new NotFoundException('Spell not found');
    }

    return spell;
  }
}
