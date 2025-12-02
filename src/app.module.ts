import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpellsModule } from './spells/spells.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { User } from './users/entities/user.entity';
import { Spell } from './spells/entities/spell.entity';
import { SpellTranslation } from './spells/entities/spell-translation.entity';
import { CharacterClass } from './spells/entities/character-class.entity';
import { Character } from './characters/entities/character.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const port = configService.get<string>('DB_PORT');

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: port ? parseInt(port, 10) : 3306,
          username: configService.get<string>('DB_USERNAME', 'root'),
          password:
            configService.get<string>('DB_PASSWORD') ??
            configService.get<string>('DB_ROOT_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'pocket_spellbook'),
          entities: [User, Spell, SpellTranslation, CharacterClass, Character],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
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
