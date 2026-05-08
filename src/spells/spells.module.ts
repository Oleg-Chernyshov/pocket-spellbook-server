import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpellsController } from './spells.controller';
import { SpellsService } from './spells.service';
import { Spell } from './entities/spell.entity';
import { CharacterClass } from './entities/character-class.entity';
import { CharacterClassesService } from './services/character-classes.service';
import { CharacterSpellsService } from './services/character-spells.service';

@Module({
  imports: [TypeOrmModule.forFeature([Spell, CharacterClass])],
  controllers: [SpellsController],
  providers: [SpellsService, CharacterClassesService, CharacterSpellsService],
  exports: [SpellsService, CharacterSpellsService],
})
export class SpellsModule {}
