import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('AuthController (e2e)', () => {
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

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user.email).toBe(newUser.email);
        });
    });

    it('should return 400 for invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
    });

    it('should return 400 for short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '123',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials and return tokens', async () => {
      const newUser = {
        email: 'logintest@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(newUser)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user.email).toBe(newUser.email);
          expect(typeof res.body.access_token).toBe('string');
          expect(typeof res.body.refresh_token).toBe('string');
        });
    });

    it('should return 401 for invalid credentials', () => {
      const invalidCredentials = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidCredentials)
        .expect(401);
    });

    it('should return 400 for invalid email format', () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidCredentials)
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const testUser = {
        email: 'refreshtest@example.com',
        password: 'password123',
      };

      // Регистрация
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Логин для получения refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      const { refresh_token } = loginResponse.body;

      // Обновление токенов
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refresh_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(typeof res.body.access_token).toBe('string');
          expect(typeof res.body.refresh_token).toBe('string');
          // Новые токены должны отличаться от старых
          expect(res.body.refresh_token).not.toBe(refresh_token);
        });
    });

    it('should return 401 for invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should return 401 for missing refresh token', () => {
      return request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should not accept access token as refresh token', async () => {
      const testUser = {
        email: 'accesstokentest@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      const { access_token } = loginResponse.body;

      // Попытка использовать access token вместо refresh token
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout user with valid access token', async () => {
      const testUser = {
        email: 'logouttest@example.com',
        password: 'password123',
      };

      // Регистрация
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Логин
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      const { access_token } = loginResponse.body;

      // Выход
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toBe('Выход выполнен успешно');
        });
    });

    it('should return 401 for logout without token', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('should return 401 for logout with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should invalidate refresh token after logout', async () => {
      const testUser = {
        email: 'invalidatetest@example.com',
        password: 'password123',
      };

      // Регистрация
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // Логин
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      const { access_token, refresh_token } = loginResponse.body;

      // Выход
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);

      // Попытка использовать refresh token после logout
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refresh_token}`)
        .expect(401);
    });
  });

  describe('Refresh Token Flow (Integration)', () => {
    it('should handle complete auth flow: register -> login -> refresh -> logout', async () => {
      const testUser = {
        email: 'flowtest@example.com',
        password: 'password123',
      };

      // 1. Регистрация
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // 2. Логин - получение токенов
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      expect(loginResponse.body).toHaveProperty('refresh_token');

      const firstRefreshToken = loginResponse.body.refresh_token;

      // 3. Обновление токенов
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${firstRefreshToken}`)
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('access_token');
      expect(refreshResponse.body).toHaveProperty('refresh_token');

      const newAccessToken = refreshResponse.body.access_token;
      const newRefreshToken = refreshResponse.body.refresh_token;

      // Новые токены должны отличаться от старых
      expect(newRefreshToken).not.toBe(firstRefreshToken);

      // 4. Старый refresh token не должен работать (token rotation)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${firstRefreshToken}`)
        .expect(401);

      // 5. Выход с новым access token
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // 6. Новый refresh token не должен работать после logout
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${newRefreshToken}`)
        .expect(401);
    });

    it('should allow multiple refreshes before logout', async () => {
      const testUser = {
        email: 'multirefresh@example.com',
        password: 'password123',
      };

      // Регистрация и логин
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      let currentRefreshToken = loginResponse.body.refresh_token;

      // Обновляем токены 3 раза
      for (let i = 0; i < 3; i++) {
        const refreshResponse = await request(app.getHttpServer())
          .post('/auth/refresh')
          .set('Authorization', `Bearer ${currentRefreshToken}`)
          .expect(200);

        expect(refreshResponse.body).toHaveProperty('access_token');
        expect(refreshResponse.body).toHaveProperty('refresh_token');

        // Каждый раз получаем новый токен
        expect(refreshResponse.body.refresh_token).not.toBe(
          currentRefreshToken,
        );

        currentRefreshToken = refreshResponse.body.refresh_token;
      }
    });
  });
});
