import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('SpellsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/spells (GET)', () => {
    it('should return all spells (paginated)', () => {
      return request(app.getHttpServer())
        .get('/spells')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter spells by level', () => {
      return request(app.getHttpServer())
        .get('/spells?level=0')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].level).toBe('0');
          }
        });
    });

    it('should filter spells by school in English', () => {
      return request(app.getHttpServer())
        .get('/spells?school=Conjuration&language=en')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].school).toBe('Conjuration');
          }
        });
    });

    it('should filter spells by school in Russian', () => {
      return request(app.getHttpServer())
        .get('/spells?school=призыв&language=ru')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].school).toBe('призыв');
          }
        });
    });

    it('should search spells by name in English', () => {
      return request(app.getHttpServer())
        .get('/spells?search=Acid&language=en')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].name).toContain('Acid');
          }
        });
    });

    it('should search spells by name in Russian', () => {
      return request(app.getHttpServer())
        .get('/spells?search=Кислот&language=ru')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            expect(res.body.data[0].name).toContain('Кислот');
          }
        });
    });

    it('should filter spells by character class', () => {
      return request(app.getHttpServer())
        .get('/spells?characterClass=1')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return localized spells in Russian', () => {
      return request(app.getHttpServer())
        .get('/spells?language=ru')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          if (res.body.data.length > 0) {
            const spell = res.body.data[0];

            expect(spell).toHaveProperty('name');
            expect(spell).toHaveProperty('text');
            expect(spell).toHaveProperty('school');
            expect(spell).toHaveProperty('castingTime');
            expect(spell).toHaveProperty('range');
            expect(spell).toHaveProperty('materials');
            expect(spell).toHaveProperty('components');
            expect(spell).toHaveProperty('duration');
            expect(spell).toHaveProperty('source');
          }
        });
    });
  });

  describe('/spells/:id (GET)', () => {
    it('should return a specific spell in English by default', () => {
      return request(app.getHttpServer())
        .get('/spells/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('text');
          expect(res.body).toHaveProperty('school');
          expect(res.body).toHaveProperty('castingTime');
          expect(res.body).toHaveProperty('range');
          expect(res.body).toHaveProperty('materials');
          expect(res.body).toHaveProperty('components');
          expect(res.body).toHaveProperty('duration');
          expect(res.body).toHaveProperty('source');
        });
    });

    it('should return a specific spell in Russian when language=ru', () => {
      return request(app.getHttpServer())
        .get('/spells/1?language=ru')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('text');
          expect(res.body).toHaveProperty('school');
          expect(res.body).toHaveProperty('castingTime');
          expect(res.body).toHaveProperty('range');
          expect(res.body).toHaveProperty('materials');
          expect(res.body).toHaveProperty('components');
          expect(res.body).toHaveProperty('duration');
          expect(res.body).toHaveProperty('source');
        });
    });

    it('should return 404 for non-existent spell', () => {
      return request(app.getHttpServer()).get('/spells/999').expect(404);
    });
  });
});
