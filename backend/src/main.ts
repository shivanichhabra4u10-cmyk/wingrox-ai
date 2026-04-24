import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('WinGroX AI - API')
    .setDescription('Enterprise Growth Intelligence Operating System API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('accounts', 'Account management')
    .addTag('reports', 'Reporting and export endpoints')
    .addTag('health', 'System health')
    .addTag('dashboard', 'Dashboard analytics endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    console.log(`✓ Server running on http://localhost:${port}`);
    console.log(`✓ API docs on http://localhost:${port}/api/docs`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
