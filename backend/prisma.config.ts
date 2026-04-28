import { defineConfig } from '@prisma/cli';

export default defineConfig({
  datasource: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://wingrox:wingrox_dev@localhost:5432/wingrox_db',
    },
  },
});