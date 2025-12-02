-- Нормализованная схема базы данных для Pocket Spellbook
-- Заклинания в классах теперь хранятся как ссылки на таблицу spells

CREATE DATABASE IF NOT EXISTS pocket_spellbook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pocket_spellbook;

-- Таблица пользователей
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
);

-- Таблица заклинаний (историческая структура с двуязычными полями)
-- Обратите внимание: новая версия приложения использует только level/created_at/updated_at
-- и таблицу spell_translations. Для миграции данных используйте scripts/migrations/001_add_spell_translations.sql
CREATE TABLE spells (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    level VARCHAR(10) NOT NULL,
    text_en TEXT NOT NULL,
    school_en VARCHAR(100) NOT NULL,
    casting_time_en VARCHAR(100) NOT NULL,
    range_en VARCHAR(100) NOT NULL,
    materials_en TEXT,
    components_en VARCHAR(100) NOT NULL,
    duration_en VARCHAR(100) NOT NULL,
    source_en VARCHAR(50) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    text_ru TEXT NOT NULL,
    school_ru VARCHAR(100) NOT NULL,
    casting_time_ru VARCHAR(100) NOT NULL,
    range_ru VARCHAR(100) NOT NULL,
    materials_ru TEXT,
    components_ru VARCHAR(100) NOT NULL,
    duration_ru VARCHAR(100) NOT NULL,
    source_ru VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Основные индексы для фильтрации
    INDEX idx_spells_level (level),
    INDEX idx_spells_school_en (school_en),
    INDEX idx_spells_school_ru (school_ru),
    INDEX idx_spells_source_en (source_en),
    INDEX idx_spells_source_ru (source_ru),
    INDEX idx_spells_created_at (created_at),
    
    -- Составные индексы для оптимизации комбинированных запросов
    INDEX idx_spells_level_school_en (level, school_en),
    INDEX idx_spells_level_school_ru (level, school_ru),
    INDEX idx_spells_level_source_en (level, source_en),
    INDEX idx_spells_level_source_ru (level, source_ru),
    
    -- Полнотекстовые индексы для поиска
    FULLTEXT INDEX ft_spells_name_en (name_en),
    FULLTEXT INDEX ft_spells_name_ru (name_ru),
    FULLTEXT INDEX ft_spells_text_en (text_en),
    FULLTEXT INDEX ft_spells_text_ru (text_ru),
    
    -- Составные полнотекстовые индексы для комбинированного поиска
    FULLTEXT INDEX ft_spells_name_text_en (name_en, text_en),
    FULLTEXT INDEX ft_spells_name_text_ru (name_ru, text_ru)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица переводов заклинаний
CREATE TABLE IF NOT EXISTS spell_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spell_id INT NOT NULL,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    school VARCHAR(100) NOT NULL,
    casting_time VARCHAR(100) NOT NULL,
    range VARCHAR(100) NOT NULL,
    materials TEXT NULL,
    components VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spell_translations_spell_id
        FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE,
    UNIQUE KEY uq_spell_translations_spell_language (spell_id, language),
    INDEX idx_spell_translations_language (language),
    FULLTEXT INDEX ft_spell_translations_name_en (name),
    FULLTEXT INDEX ft_spell_translations_text_en (text),
    FULLTEXT INDEX ft_spell_translations_name_text_en (name, text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица классов персонажей
CREATE TABLE character_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title_en VARCHAR(100) NOT NULL,
    title_ru VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Индексы для быстрого поиска классов
    INDEX idx_character_classes_title_en (title_en),
    INDEX idx_character_classes_title_ru (title_ru),
    UNIQUE INDEX idx_character_classes_title_en_unique (title_en),
    UNIQUE INDEX idx_character_classes_title_ru_unique (title_ru)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица связи классов и заклинаний (многие ко многим)
CREATE TABLE character_class_spells (
    character_class_id INT NOT NULL,
    spell_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Составной первичный ключ
    PRIMARY KEY (character_class_id, spell_id),
    
    -- Дополнительные индексы для оптимизации JOIN запросов
    INDEX idx_character_class_spells_spell_id (spell_id),
    INDEX idx_character_class_spells_created_at (created_at),
    
    -- Внешние ключи с оптимизацией
    CONSTRAINT fk_character_class_spells_class_id 
        FOREIGN KEY (character_class_id) REFERENCES character_classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_character_class_spells_spell_id 
        FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица персонажей
CREATE TABLE characters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    character_class_id INT NOT NULL,
    spell_slots JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Индексы для персонажей
    INDEX idx_characters_user_id (user_id),
    INDEX idx_characters_name (name),
    INDEX idx_characters_class_id (character_class_id),
    INDEX idx_characters_created_at (created_at),
    
    -- Внешние ключи с оптимизацией
    CONSTRAINT fk_characters_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_characters_class_id 
        FOREIGN KEY (character_class_id) REFERENCES character_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица связи персонажей и заклинаний
CREATE TABLE character_spells (
    character_id INT NOT NULL,
    spell_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Составной первичный ключ
    PRIMARY KEY (character_id, spell_id),
    
    -- Дополнительные индексы для оптимизации JOIN запросов
    INDEX idx_character_spells_spell_id (spell_id),
    INDEX idx_character_spells_created_at (created_at),
    
    -- Внешние ключи с оптимизацией
    CONSTRAINT fk_character_spells_character_id 
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    CONSTRAINT fk_character_spells_spell_id 
        FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
