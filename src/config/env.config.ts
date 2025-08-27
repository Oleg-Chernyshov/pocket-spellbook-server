// Copy this configuration to .env file in project root
export const envConfig = {
  // Database Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT:
    typeof process.env.DB_PORT === 'string'
      ? parseInt(process.env.DB_PORT)
      : 3306,
  DB_USERNAME: process.env.DB_USERNAME || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_DATABASE: process.env.DB_DATABASE || 'pocket_spellbook',

  // JWT Configuration
  JWT_SECRET:
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT:
    typeof process.env.PORT === 'string' ? parseInt(process.env.PORT) : 3000,
};
