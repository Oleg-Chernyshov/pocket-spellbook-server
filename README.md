<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Pocket Spellbook Server

Серверная часть приложения для управления заклинаниями, персонажами и классами персонажей в D&D 5e.

## 🚀 Возможности

- **Управление заклинаниями** - Полный каталог заклинаний с поддержкой пагинации и фильтрации
- **Мультиязычность** - Поддержка английского и русского языков
- **Полнотекстовый поиск** - Быстрый поиск по названию и описанию заклинаний
- **Управление персонажами** - Создание и управление персонажами с изучением заклинаний
- **Система классов** - Поддержка всех классов персонажей
- **JWT аутентификация** - Безопасная система входа и регистрации
- **API документация** - Полная Swagger документация для всех эндпоинтов

## 📚 API Документация

После запуска приложения Swagger документация доступна по адресу:
**http://localhost:3000/api/docs**

Подробное руководство по использованию API: [docs/SWAGGER_GUIDE.md](docs/SWAGGER_GUIDE.md)

## 🛠 Технологии

- **NestJS** - Фреймворк для создания масштабируемых серверных приложений
- **TypeORM** - ORM для работы с базой данных
- **MySQL** - Реляционная база данных
- **JWT** - Аутентификация и авторизация
- **Swagger** - Автоматическая генерация API документации
- **Class Validator** - Валидация входящих данных
- **Passport** - Стратегии аутентификации

## 📋 Требования

- Node.js 18+ (рекомендуется 18.18+)
- npm или yarn
- **База данных (один из вариантов):**
  - MySQL 8.0+ (FULLTEXT индексы для поиска) - локальная установка
  - **ИЛИ** Docker Desktop - для запуска MySQL в контейнере (рекомендуется для разработки)

## 🔧 Установка

1. **Клонируйте репозиторий:**

```bash
git clone <repository-url>
cd pocket-spellbook-server
```

2. **Установите зависимости:**

```bash
npm install
```

3. **Настройте базу данных:**

   **Вариант А: Использование Docker (рекомендуется для разработки)**

   ```bash
   # Запустите MySQL и phpMyAdmin в Docker
   docker compose up -d
   ```

   **Вариант Б: Локальная установка MySQL**

   ```bash
   # Создайте базу данных MySQL
   mysql -u root -p
   CREATE DATABASE pocket_spellbook;
   USE pocket_spellbook;

   # Выполните SQL скрипт для создания таблиц
   mysql -u root -p pocket_spellbook < scripts/database.sql

   # (опционально) Загрузите данные
   mysql -u root -p pocket_spellbook < scripts/pocket_spellboock_minimal_bd.sql
   ```

4. **Настройте переменные окружения:**
   Создайте файл `.env` в корне проекта:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=pocket_spellbook
JWT_SECRET=your_jwt_secret_key
```

5. **Запустите приложение:**

```bash
# Режим разработки
npm run start:dev

# Продакшн режим
npm run start:prod
```

## 🐳 Запуск с Docker

Для быстрого запуска MySQL и phpMyAdmin с помощью Docker Compose:

### Предварительные требования:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) установлен и запущен
- Docker Compose (входит в состав Docker Desktop)

### Быстрый старт:

1. **Убедитесь, что Docker Desktop запущен** (иконка Docker в системном трее должна быть активна)

2. **Запустите контейнеры:**

```bash
# Используйте одну из этих команд (в зависимости от версии Docker):
docker compose up -d

# ИЛИ (для старых версий Docker):
docker-compose up -d
```

3. **Проверьте статус контейнеров:**

```bash
docker compose ps
```

4. **Доступ к сервисам:**

   - **MySQL**: `localhost:3306`
     - Пользователь: `root`
     - Пароль: `rootpassword` (по умолчанию)
     - База данных: `pocket_spellbook` (создается автоматически)
   
   - **phpMyAdmin**: http://localhost:8888
     - Сервер: `mysql`
     - Пользователь: `root`
     - Пароль: `rootpassword` (по умолчанию)

### Настройка переменных окружения:

Создайте файл `.env` в корне проекта для настройки параметров:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_ROOT_PASSWORD=rootpassword
DB_DATABASE=pocket_spellbook

# phpMyAdmin Configuration
PMA_PORT=8888

# Application Configuration
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```
### Структура Docker Compose:

Проект использует `docker-compose.yml` с двумя сервисами:

- **mysql** - MySQL 8.0 сервер
  - Автоматическая инициализация БД из `scripts/database.sql`
  - Healthcheck для проверки готовности
  - Персистентное хранилище данных

- **phpmyadmin** - Веб-интерфейс для управления MySQL
  - Автоматическое подключение к MySQL контейнеру
  - Зависит от готовности MySQL (healthcheck)

## 🌐 API Эндпоинты

### Аутентификация

- `POST /auth/login` - Вход в систему
- `POST /auth/register` - Регистрация пользователя

### Заклинания

- `GET /spells` - Список заклинаний с фильтрацией и пагинацией
- `GET /spells/count` - Количество заклинаний (ответ: `{ "total": number }`)
- `GET /spells/:id` - Заклинание по ID
- `GET /spells/search/fulltext` - Полнотекстовый поиск

### Персонажи (требует аутентификации)

- `POST /characters` - Создать персонажа
- `GET /characters` - Список персонажей пользователя
- `GET /characters/:id` - Персонаж по ID
- `PUT /characters/:id` - Обновить персонажа
- `DELETE /characters/:id` - Удалить персонажа
- `GET /characters/:id/spells` - Заклинания персонажа
- `POST /characters/:id/spells/:spellId` - Изучить заклинание
- `DELETE /characters/:id/spells/:spellId` - Забыть заклинание

## 🔍 Фильтрация и поиск

### Параметры фильтрации заклинаний:

- `level` - Уровень заклинания (0-9)
- `school` - Школа магии
- `characterClass` - Класс персонажа
- `language` - Язык локализации (en/ru)
- `source` - Источник заклинания
- `page` - Номер страницы (по умолчанию: 1)
- `limit` - Количество элементов (по умолчанию: 20, максимум: 100)

### Примеры запросов:

```bash
# Поиск заклинаний 3-го уровня школы Evocation
GET /spells?level=3&school=Evocation

# Полнотекстовый поиск по слову "fire"
GET /spells/search/fulltext?query=fire

# Заклинания для класса Wizard на русском языке
GET /spells?characterClass=wizard&language=ru

# Пагинация с фильтрацией
GET /spells?level=1&page=2&limit=10
```

Примечания:

- Полнотекстовый поиск работает при наличии `FULLTEXT` индексов (см. `scripts/database.sql`).
- Структура БД нормализована: связи многие‑ко‑многим через `character_class_spells` и `character_spells`.

## 🗄 Структура базы данных

### Основные таблицы:

- `spells` - Заклинания
- `character_classes` - Классы персонажей
- `character_class_spells` - Связь классов и заклинаний
- `characters` - Персонажи пользователей
- `character_spells` - Изученные заклинания персонажей
- `users` - Пользователи системы

### Особенности:

- **Нормализованная структура** - Эффективные JOIN запросы вместо JSON
- **Полнотекстовые индексы** - Быстрый поиск по тексту
- **Составные индексы** - Оптимизация сложных запросов
- **Внешние ключи** - Целостность данных

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm run test:cov

# Запуск e2e тестов
npm run test:e2e

# Запуск конкретного теста
npm test -- --testPathPattern=spells.service.spec.ts
```

## 📊 Производительность

- **Полнотекстовый поиск** - Использование MySQL MATCH AGAINST
- **Оптимизированные JOIN** - Эффективные запросы к связанным таблицам
- **Пагинация** - Загрузка только необходимых данных
- **Индексы** - Быстрый доступ к часто используемым полям

## 🔐 Безопасность

- **JWT токены** - Безопасная аутентификация
- **Валидация данных** - Проверка всех входящих данных
- **Защищенные маршруты** - Guard для приватных эндпоинтов
- **Хеширование паролей** - Безопасное хранение учетных данных

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 🔄 Обновления

### v1.0.0

- Базовая функциональность API
- Управление заклинаниями и персонажами
- JWT аутентификация
- Swagger документация
- Мультиязычность (EN/RU)
- Полнотекстовый поиск
- Пагинация и фильтрация
- Нормализованная структура базы данных
