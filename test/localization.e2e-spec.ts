import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('Localization System (e2e)', () => {
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

  describe('Spell Localization', () => {
    it('should return English fields by default', () => {
      return request(app.getHttpServer())
        .get('/spells')
        .expect(200)
        .expect((res) => {
          if (res.body.length > 0) {
            const spell = res.body[0];
            expect(spell).toHaveProperty('name');
            expect(spell).toHaveProperty('text');
            expect(spell).toHaveProperty('school');
            expect(spell).toHaveProperty('castingTime');
            expect(spell).toHaveProperty('range');
            expect(spell).toHaveProperty('materials');
            expect(spell).toHaveProperty('components');
            expect(spell).toHaveProperty('duration');
            expect(spell).toHaveProperty('source');

            expect(spell).not.toHaveProperty('nameEn');
            expect(spell).not.toHaveProperty('nameRu');
            expect(spell).not.toHaveProperty('textEn');
            expect(spell).not.toHaveProperty('textRu');
          }
        });
    });

    it('should return Russian fields when language=ru', () => {
      return request(app.getHttpServer())
        .get('/spells?language=ru')
        .expect(200)
        .expect((res) => {
          if (res.body.length > 0) {
            const spell = res.body[0];
            expect(spell).toHaveProperty('name');
            expect(spell).toHaveProperty('text');
            expect(spell).toHaveProperty('school');
            expect(spell).toHaveProperty('castingTime');
            expect(spell).toHaveProperty('range');
            expect(spell).toHaveProperty('materials');
            expect(spell).toHaveProperty('components');
            expect(spell).toHaveProperty('duration');
            expect(spell).toHaveProperty('source');

            expect(spell).not.toHaveProperty('nameEn');
            expect(spell).not.toHaveProperty('nameRu');
            expect(spell).not.toHaveProperty('textEn');
            expect(spell).not.toHaveProperty('textRu');
          }
        });
    });

    it('should return English fields when language=en', () => {
      return request(app.getHttpServer())
        .get('/spells?language=en')
        .expect(200)
        .expect((res) => {
          if (res.body.length > 0) {
            const spell = res.body[0];
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

    it('should maintain consistent field structure across languages', () => {
      return Promise.all([
        request(app.getHttpServer()).get('/spells?language=en'),
        request(app.getHttpServer()).get('/spells?language=ru'),
      ]).then((responses) => {
        const [enResponse, ruResponse] = responses;
        if (enResponse.body.length > 0 && ruResponse.body.length > 0) {
          const enSpell = enResponse.body[0];
          const ruSpell = ruResponse.body[0];

          const enFields = Object.keys(enSpell).sort();
          const ruFields = Object.keys(ruSpell).sort();

          expect(enFields).toEqual(ruFields);

          expect(enSpell.id).toBe(ruSpell.id);
          expect(enSpell.level).toBe(ruSpell.level);

          if (enSpell.name && ruSpell.name) {
            expect(enSpell.name).not.toBe(ruSpell.name);
          }
        }
      });
    });
  });

  describe('Individual Spell Localization', () => {
    it('should return English spell by default', () => {
      return request(app.getHttpServer())
        .get('/spells/1')
        .expect(200)
        .expect((res) => {
          const spell = res.body;
          expect(spell).toHaveProperty('name');
          expect(spell).toHaveProperty('text');
          expect(spell).toHaveProperty('school');
          expect(spell).toHaveProperty('castingTime');
          expect(spell).toHaveProperty('range');
          expect(spell).toHaveProperty('materials');
          expect(spell).toHaveProperty('components');
          expect(spell).toHaveProperty('duration');
          expect(spell).toHaveProperty('source');
        });
    });

    it('should return Russian spell when language=ru', () => {
      return request(app.getHttpServer())
        .get('/spells/1?language=ru')
        .expect(200)
        .expect((res) => {
          const spell = res.body;
          expect(spell).toHaveProperty('name');
          expect(spell).toHaveProperty('text');
          expect(spell).toHaveProperty('school');
          expect(spell).toHaveProperty('castingTime');
          expect(spell).toHaveProperty('range');
          expect(spell).toHaveProperty('materials');
          expect(spell).toHaveProperty('components');
          expect(spell).toHaveProperty('duration');
          expect(spell).toHaveProperty('source');
        });
    });
  });
});
