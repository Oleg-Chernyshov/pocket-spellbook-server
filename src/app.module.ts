import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SpellsModule } from './spells/spells.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { User } from './users/entities/user.entity';
import { Spell } from './spells/entities/spell.entity';
import { SpellTranslation } from './spells/entities/spell-translation.entity';
import { CharacterClass } from './spells/entities/character-class.entity';
import { Character } from './characters/entities/character.entity';
import { configuration, validateEnvironment } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const commonOptions = {
          entities: [User, Spell, SpellTranslation, CharacterClass, Character],
          synchronize: configService.get<boolean>(
            'database.synchronize',
            false,
          ),
          logging: configService.get<boolean>('database.logging', false),
        };

        if (configService.get<string>('database.type') === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('database.name', ':memory:'),
            ...commonOptions,
          };
        }

        return {
          type: 'mysql',
          host: configService.get<string>('database.host', 'localhost'),
          port: configService.get<number>('database.port', 3306),
          username: configService.get<string>('database.username', 'root'),
          password: configService.get<string>('database.password', ''),
          database: configService.get<string>(
            'database.name',
            'pocket_spellbook',
          ),
          ...commonOptions,
        };
      },
      inject: [ConfigService],
    }),
    SpellsModule,
    UsersModule,
    AuthModule,
    CharactersModule,
  ],
})
export class AppModule {}
