import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { Spell } from '../spells/entities/spell.entity';
import {
  CreateCharacterDto,
  AddSpellToCharacterDto,
  UpdateCharacterDto,
} from './dto/character.dto';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(Spell)
    private spellsRepository: Repository<Spell>,
  ) {}

  async create(
    createCharacterDto: CreateCharacterDto,
    userId: number,
  ): Promise<Character> {
    const character = this.charactersRepository.create({
      ...createCharacterDto,
      userId,
    });

    return this.charactersRepository.save(character);
  }

  async findAllByUser(userId: number): Promise<Character[]> {
    return this.charactersRepository.find({
      where: { userId },
      relations: ['spells'],
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
      relations: ['spells', 'characterClass'],
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

  private async getSpellById(spellId: number): Promise<Spell> {
    const spell = await this.spellsRepository.findOne({
      where: { id: spellId },
    });

    if (!spell) {
      throw new NotFoundException('Заклинание не найдено');
    }

    return spell;
  }
}
