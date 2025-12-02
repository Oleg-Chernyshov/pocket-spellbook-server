-- Migration: create spell_translations table and populate it from existing spells data
-- This script is intended to be run on an existing schema where table `spells`
-- contains bilingual columns: name_en, text_en, ..., name_ru, text_ru, ...

START TRANSACTION;

-- 1. Create new table for translations (if it does not exist yet)
CREATE TABLE IF NOT EXISTS spell_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spell_id INT NOT NULL,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    school VARCHAR(100) NOT NULL,
    -- Используем TEXT для избежания обрезки длинных значений (Data truncated)
    casting_time TEXT NOT NULL,
    `range` TEXT NOT NULL,
    materials TEXT NULL,
    components VARCHAR(100) NOT NULL,
    duration TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spell_translations_spell_id
        FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE,
    UNIQUE KEY uq_spell_translations_spell_language (spell_id, language),
    INDEX idx_spell_translations_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Copy English data into translations (skip if already migrated)
INSERT INTO spell_translations (
    spell_id,
    language,
    name,
    text,
    school,
    casting_time,
    `range`,
    materials,
    components,
    duration,
    source,
    created_at,
    updated_at
)
SELECT
    s.id AS spell_id,
    'en' AS language,
    s.name_en AS name,
    s.text_en AS text,
    s.school_en AS school,
    s.casting_time_en AS casting_time,
    s.range_en AS `range`,
    s.materials_en AS materials,
    s.components_en AS components,
    s.duration_en AS duration,
    s.source_en AS source,
    s.created_at,
    s.updated_at
FROM spells s
LEFT JOIN spell_translations st
    ON st.spell_id = s.id AND st.language = 'en'
WHERE st.id IS NULL;

-- 3. Copy Russian data into translations (skip if already migrated)
INSERT INTO spell_translations (
    spell_id,
    language,
    name,
    text,
    school,
    casting_time,
    `range`,
    materials,
    components,
    duration,
    source,
    created_at,
    updated_at
)
SELECT
    s.id AS spell_id,
    'ru' AS language,
    s.name_ru AS name,
    s.text_ru AS text,
    s.school_ru AS school,
    s.casting_time_ru AS casting_time,
    s.range_ru AS `range`,
    s.materials_ru AS materials,
    s.components_ru AS components,
    s.duration_ru AS duration,
    s.source_ru AS source,
    s.created_at,
    s.updated_at
FROM spells s
LEFT JOIN spell_translations st
    ON st.spell_id = s.id AND st.language = 'ru'
WHERE st.id IS NULL;

COMMIT;

-- Optional (manual step): after you deploy the new code and verify everything,
-- you can drop old bilingual columns from `spells` table to fully complete 3NF:
-- ALTER TABLE spells
--   DROP COLUMN name_en,
--   DROP COLUMN text_en,
--   DROP COLUMN school_en,
--   DROP COLUMN casting_time_en,
--   DROP COLUMN range_en,
--   DROP COLUMN materials_en,
--   DROP COLUMN components_en,
--   DROP COLUMN duration_en,
--   DROP COLUMN source_en,
--   DROP COLUMN name_ru,
--   DROP COLUMN text_ru,
--   DROP COLUMN school_ru,
--   DROP COLUMN casting_time_ru,
--   DROP COLUMN range_ru,
--   DROP COLUMN materials_ru,
--   DROP COLUMN components_ru,
--   DROP COLUMN duration_ru,
--   DROP COLUMN source_ru;



