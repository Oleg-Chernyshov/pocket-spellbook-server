CREATE DATABASE IF NOT EXISTS pocket_spellbook
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pocket_spellbook;

-- Пользователи приложения.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL,
  refresh_token VARCHAR(255) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Базовая запись заклинания. Локализованные поля хранятся в spell_translations.
CREATE TABLE IF NOT EXISTS spells (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level VARCHAR(10) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_spells_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Переводы заклинаний по языкам.
CREATE TABLE IF NOT EXISTS spell_translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spell_id INT NOT NULL,
  language VARCHAR(5) NOT NULL,
  name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  school VARCHAR(100) NOT NULL,
  casting_time VARCHAR(100) NOT NULL,
  `range` VARCHAR(100) NOT NULL,
  materials TEXT NULL,
  components VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_spell_translations_spell_id
    FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE,
  UNIQUE KEY uq_spell_translations_spell_language (spell_id, language),
  INDEX idx_spell_translations_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Классы персонажей.
CREATE TABLE IF NOT EXISTS character_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(100) NOT NULL,
  title_ru VARCHAR(100) NOT NULL,
  has_spells TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_character_classes_title_en (title_en),
  UNIQUE KEY uq_character_classes_title_ru (title_ru)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Доступные заклинания класса.
CREATE TABLE IF NOT EXISTS character_class_spells (
  character_class_id INT NOT NULL,
  spell_id INT NOT NULL,
  PRIMARY KEY (character_class_id, spell_id),
  INDEX idx_character_class_spells_spell_id (spell_id),
  CONSTRAINT fk_character_class_spells_class_id
    FOREIGN KEY (character_class_id) REFERENCES character_classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_character_class_spells_spell_id
    FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Персонажи пользователей.
CREATE TABLE IF NOT EXISTS characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  character_class_id INT NOT NULL,
  spell_slots JSON NOT NULL DEFAULT (JSON_OBJECT()),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX idx_characters_user_id (user_id),
  INDEX idx_characters_class_id (character_class_id),
  CONSTRAINT fk_characters_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_characters_class_id
    FOREIGN KEY (character_class_id) REFERENCES character_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Изученные заклинания персонажа.
CREATE TABLE IF NOT EXISTS character_spells (
  character_id INT NOT NULL,
  spell_id INT NOT NULL,
  PRIMARY KEY (character_id, spell_id),
  INDEX idx_character_spells_spell_id (spell_id),
  CONSTRAINT fk_character_spells_character_id
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  CONSTRAINT fk_character_spells_spell_id
    FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
