# Инструкции по развертыванию

## 1. Создание базы данных

1. Подключитесь к MySQL серверу:

```bash
mysql -u root -p
```

2. Выполните скрипт создания базы данных:

```sql
source scripts/database.sql;
```

## 2. Вставка тестовых данных

Выполните скрипт с примерными данными:

```sql
source scripts/sample-data.sql;
```

Важно:

- Убедитесь, что используете MySQL 8.0+.
- Перед вставкой данных выполните `scripts/database.sql`, где создаются необходимые таблицы и `FULLTEXT` индексы для полнотекстового поиска.

## 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта с вашими настройками:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=pocket_spellbook

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000
```

## 4. Установка зависимостей

```bash
npm install
```

## 5. Запуск приложения

```bash
npm run start:dev
```

Примечание:

- Полнотекстовый поиск в эндпоинтах `/spells` и `/spells/search/fulltext` будет работать только при наличии соответствующих `FULLTEXT` индексов (создаются в `scripts/database.sql`).

## Проверка API

1. Регистрация пользователя:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}'
```

2. Вход в систему:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. Получение заклинаний:

```bash
curl http://localhost:3000/spells
```

Полный список брейкопинтов и api для них описаны в swagger
