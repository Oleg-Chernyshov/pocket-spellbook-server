import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { Spell } from '../spells/entities/spell.entity';
import { SpellsModule } from '../spells/spells.module';

@Module({
  imports: [TypeOrmModule.forFeature([Character, Spell]), SpellsModule],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}
