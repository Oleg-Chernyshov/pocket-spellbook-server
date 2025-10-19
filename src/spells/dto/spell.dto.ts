import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Массив данных',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Информация о пагинации',
    example: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class SpellFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Уровень заклинания',
    example: '3',
    enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    description: 'Школа магии',
    example: 'Evocation',
    enum: [
      'Abjuration',
      'Conjuration',
      'Divination',
      'Enchantment',
      'Evocation',
      'Illusion',
      'Necromancy',
      'Transmutation',
    ],
  })
  @IsOptional()
  @IsString()
  school?: string;

  @ApiPropertyOptional({
    description: 'Поисковый запрос (поиск по названию и описанию)',
    example: 'fire',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'ID класса персонажа',
    example: 9,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  characterClass?: number;

  @ApiPropertyOptional({
    description: 'Язык локализации',
    example: 'en',
    enum: ['en', 'ru'],
    default: 'en',
  })
  @IsOptional()
  @IsString()
  language?: 'en' | 'ru' = 'en';

  @ApiPropertyOptional({
    description: 'Источник заклинания',
    example: 'PHB',
    enum: ['PHB', 'XGE', 'TCE', 'FTD', 'EGW'],
  })
  @IsOptional()
  @IsString()
  source?: string;
}
