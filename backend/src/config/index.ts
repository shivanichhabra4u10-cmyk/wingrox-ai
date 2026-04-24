export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '24h',
  refreshExpiresIn: '7d',
};

export const dbConfig = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
};

export const corsConfig = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
};

export const apiConfig = {
  prefix: process.env.API_PREFIX || 'api',
  port: parseInt(process.env.PORT || '3001', 10),
};
