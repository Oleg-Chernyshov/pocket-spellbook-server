import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CharacterDto {
  @ApiProperty({
    description: 'Имя персонажа',
    example: 'Gandalf',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID класса персонажа',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  characterClassId: number;
  @ApiPropertyOptional({
    description: 'Слоты заклинаний по уровням',
    example: {
      '1': 4,
      '2': 3,
      '3': 2,
    },
  })
  @IsOptional()
  spellSlots?: Record<string, number>;
}

export class CreateCharacterDto extends CharacterDto {}

export class UpdateCharacterDto {
  @ApiPropertyOptional({
    description: 'Имя персонажа',
    example: 'Gandalf the Grey',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'ID класса персонажа',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  characterClassId?: number;

  @ApiPropertyOptional({
    description: 'Слоты заклинаний по уровням',
    example: {
      '1': 4,
      '2': 3,
      '3': 3,
    },
  })
  @IsOptional()
  spellSlots?: Record<string, number>;
}

export class AddSpellToCharacterDto {
  @ApiProperty({
    description: 'ID заклинания для добавления',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  spellId: number;
}
