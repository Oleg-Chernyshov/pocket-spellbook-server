type Environment = Record<string, string | undefined>;

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value === 'true';
};

export const configuration = () => ({
  app: {
    port: parsePort(process.env.PORT, 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parsePort(process.env.DB_PORT, 3306),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD ?? process.env.DB_ROOT_PASSWORD ?? '',
    name: process.env.DB_DATABASE || 'pocket_spellbook',
    synchronize: parseBoolean(process.env.DB_SYNCHRONIZE, false),
    logging: parseBoolean(
      process.env.DB_LOGGING,
      process.env.NODE_ENV === 'development',
    ),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-access-token-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-token-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});

export const validateEnvironment = (env: Environment) => {
  if (env.NODE_ENV === 'production') {
    const requiredVariables = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missingVariables = requiredVariables.filter((key) => !env[key]);

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missingVariables.join(
          ', ',
        )}`,
      );
    }
  }

  return env;
};
