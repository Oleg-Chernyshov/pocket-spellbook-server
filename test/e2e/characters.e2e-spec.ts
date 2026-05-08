import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './create-test-app';

describe('CharactersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    app = await createTestApp({ seedSpells: true });

    const credentials = {
      email: 'character-e2e@example.com',
      password: 'password123',
      name: 'Character Owner',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password,
      })
      .expect(200);

    accessToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject requests without access token', () => {
    return request(app.getHttpServer()).get('/characters').expect(401);
  });

  it('should create a character with default empty spell slots', () => {
    return request(app.getHttpServer())
      .post('/characters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Gandalf',
        characterClassId: 1,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('message', 'Персонаж успешно создан');
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Gandalf');
        expect(res.body.characterClassId).toBe(1);
        expect(res.body.spellSlots).toEqual({});
      });
  });

  it('should manage the character lifecycle and learned spells', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/characters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Merlin',
        characterClassId: 1,
        spellSlots: { '1': 2 },
      })
      .expect(201);

    const characterId = createResponse.body.id;

    await request(app.getHttpServer())
      .get('/characters')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((character) => character.id === characterId)).toBe(
          true,
        );
      });

    await request(app.getHttpServer())
      .get(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(characterId);
        expect(res.body.name).toBe('Merlin');
      });

    await request(app.getHttpServer())
      .put(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Merlin the Wise' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Merlin the Wise');
        expect(res.body.message).toBe('Персонаж успешно обновлен');
      });

    await request(app.getHttpServer())
      .post(`/characters/${characterId}/spells/1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Заклинание успешно изучено');
        expect(res.body.character.spells).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .get(`/characters/${characterId}/spells`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ language: 'ru' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Кислотные брызги');
      });

    await request(app.getHttpServer())
      .delete(`/characters/${characterId}/spells/1`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Заклинание успешно забыто');
        expect(res.body.character.spells).toHaveLength(0);
      });

    await request(app.getHttpServer())
      .delete(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/characters/${characterId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
