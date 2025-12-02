import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpellsController } from './spells.controller';
import { SpellsService } from './spells.service';
import { Spell } from './entities/spell.entity';
import { SpellTranslation } from './entities/spell-translation.entity';
import { CharacterClass } from './entities/character-class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spell, SpellTranslation, CharacterClass])],
  controllers: [SpellsController],
  providers: [SpellsService],
  exports: [SpellsService],
})
export class SpellsModule {}
