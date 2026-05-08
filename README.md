# Pocket Spellbook Server

Серверная часть приложения для управления заклинаниями, персонажами и классами персонажей D&D 5e.

## Возможности

- Каталог заклинаний с пагинацией, фильтрацией и поиском.
- Локализация данных заклинаний на английском и русском языках.
- Регистрация, вход, обновление токенов и выход через JWT.
- Управление персонажами пользователя и списком изученных заклинаний.
- Swagger-документация для HTTP API.

## Технологии

- NestJS
- TypeORM
- MySQL
- Passport JWT
- class-validator и class-transformer
- Swagger
- Jest и Supertest

## Требования

- Node.js 18+
- npm
- MySQL 8.0+ или Docker Desktop

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env` в корне проекта:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_ROOT_PASSWORD=rootpassword
DB_DATABASE=pocket_spellbook
DB_SYNCHRONIZE=false
DB_LOGGING=true

PMA_PORT=8888

JWT_SECRET=replace-with-local-access-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=replace-with-local-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

3. Запустите MySQL через Docker:

```bash
docker compose up -d
```

`docker-compose.yml` создает MySQL и phpMyAdmin. База инициализируется из `scripts/database.sql`.

4. Запустите приложение:

```bash
npm run start:dev
```

Swagger доступен по адресу `http://localhost:3000/api/docs`.

## Работа с базой данных

Канонический SQL-скрипт схемы находится в `scripts/database.sql`.

Автоматическая синхронизация TypeORM выключена по умолчанию. Для временной локальной разработки ее можно включить через:

```env
DB_SYNCHRONIZE=true
```

Для общих окружений используйте явные SQL-скрипты или миграции, а не `synchronize`.

## API

### Аутентификация

- `POST /auth/register` - регистрация пользователя.
- `POST /auth/login` - вход и получение access/refresh-токенов.
- `POST /auth/refresh` - обновление пары токенов.
- `POST /auth/logout` - выход и сброс refresh token.

### Заклинания

- `GET /spells` - список заклинаний.
- `GET /spells/:id` - заклинание по ID.
- `GET /spells/classes` - список классов персонажей.
- `GET /spells/class/:classId/stats` - статистика заклинаний класса.

Поддерживаемые параметры `GET /spells`:

- `page` - номер страницы, по умолчанию `1`.
- `limit` - размер страницы, по умолчанию `20`, максимум `100`.
- `level` - уровень заклинания.
- `school` - школа магии.
- `source` - источник.
- `search` - поиск по названию и тексту.
- `characterClass` - ID класса персонажа.
- `language` - язык локализации: `en` или `ru`.

`GET /spells/class/:classId/stats` также поддерживает `language=en|ru` для локализации школ магии в статистике.

### Персонажи

Все маршруты персонажей требуют access-токен.

- `POST /characters` - создать персонажа.
- `GET /characters` - получить персонажей текущего пользователя.
- `GET /characters/:id` - получить персонажа по ID.
- `PUT /characters/:id` - обновить персонажа.
- `DELETE /characters/:id` - удалить персонажа.
- `GET /characters/:id/spells` - получить изученные заклинания персонажа.
- `POST /characters/:id/spells/:spellId` - добавить заклинание персонажу.
- `DELETE /characters/:id/spells/:spellId` - удалить заклинание у персонажа.

## Структура проекта

- `src/auth` - аутентификация, JWT-стратегии и guards.
- `src/users` - пользователи и работа с учетными данными.
- `src/spells` - каталог заклинаний, классы персонажей и связи с персонажами.
- `src/characters` - персонажи пользователя.
- `src/config` - конфигурация приложения.
- `src/swagger` - общие примеры Swagger.
- `test/unit` - unit-тесты.
- `test/e2e` - e2e-тесты.
- `scripts` - SQL-скрипты базы данных.

## Команды

```bash
npm run start:dev
npm run build
npm test
npm run test:e2e
npm run test:cov
npm run format
```

## Проверка перед изменениями

Перед отправкой изменений рекомендуется выполнить:

```bash
npm run format
npm test -- --runInBand
npm run build
npm run test:e2e -- --runInBand
```
