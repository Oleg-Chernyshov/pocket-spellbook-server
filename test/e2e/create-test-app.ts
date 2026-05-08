import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { seedSpells } from './seed-spells';

interface CreateTestAppOptions {
  seedSpells?: boolean;
}

export const createTestApp = async (
  options: CreateTestAppOptions = {},
): Promise<INestApplication> => {
  process.env.DB_TYPE = 'sqlite';
  process.env.DB_DATABASE = ':memory:';
  process.env.DB_SYNCHRONIZE = 'true';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  if (options.seedSpells) {
    await seedSpells(app);
  }

  return app;
};
