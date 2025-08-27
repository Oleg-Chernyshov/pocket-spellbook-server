export const ApiExamples = {
  // Примеры заклинаний
  spell: {
    id: 1,
    name: 'Fireball',
    level: '3',
    school: 'Evocation',
    text: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
    castingTime: '1 action',
    range: '150 feet',
    materials: 'A tiny ball of bat guano and sulfur',
    components: 'V, S, M',
    duration: 'Instantaneous',
    source: 'PHB',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Примеры классов персонажей
  characterClass: {
    id: 1,
    titleEn: 'Wizard',
    titleRu: 'Волшебник',
    spells: [
      {
        id: 1,
        name: 'Fireball',
        level: '3',
        school: 'Evocation',
      },
      {
        id: 2,
        name: 'Magic Missile',
        level: '1',
        school: 'Evocation',
      },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Примеры персонажей
  character: {
    id: 1,
    name: 'Gandalf',
    userId: 1,
    characterClassId: 1,
    spellSlots: {
      '1': 4,
      '2': 3,
      '3': 2,
    },
    spells: [
      {
        id: 1,
        name: 'Fireball',
        level: '3',
        school: 'Evocation',
      },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Примеры пользователей
  user: {
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },

  // Примеры пагинации
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNext: true,
    hasPrev: false,
  },

  // Примеры ошибок
  errors: {
    validation: {
      statusCode: 400,
      message: [
        'email must be an email',
        'password must be longer than or equal to 6 characters',
      ],
      error: 'Bad Request',
    },
    unauthorized: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
    notFound: {
      statusCode: 404,
      message: 'Spell not found',
      error: 'Not Found',
    },
    conflict: {
      statusCode: 409,
      message: 'User already exists',
      error: 'Conflict',
    },
    internal: {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    },
  },

  // Примеры успешных ответов
  success: {
    created: {
      message: 'Resource created successfully',
    },
    updated: {
      message: 'Resource updated successfully',
    },
    deleted: {
      message: 'Resource deleted successfully',
    },
    login: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'John Doe',
      },
    },
  },

  // Примеры фильтров
  filters: {
    spell: {
      level: '3',
      school: 'Evocation',
      search: 'fire',
      characterClass: 'Wizard',
      language: 'en',
      source: 'PHB',
      page: 1,
      limit: 20,
    },
  },

  // Примеры статистики
  stats: {
    classSpells: {
      total: 50,
      byLevel: {
        '0': 5,
        '1': 10,
        '2': 8,
        '3': 7,
        '4': 6,
        '5': 4,
        '6': 3,
        '7': 3,
        '8': 2,
        '9': 2,
      },
      bySchool: {
        Abjuration: 8,
        Conjuration: 10,
        Divination: 5,
        Enchantment: 6,
        Evocation: 12,
        Illusion: 4,
        Necromancy: 3,
        Transmutation: 2,
      },
    },
  },
};
