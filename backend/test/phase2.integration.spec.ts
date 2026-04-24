import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 2 Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/dashboard/overview returns dashboard payload', async () => {
    const res = await request(app.getHttpServer()).get('/api/dashboard/overview').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('metrics');
    expect(Array.isArray(res.body.data.metrics)).toBe(true);
  });

  it('GET /api/accounts rejects without auth token', async () => {
    await request(app.getHttpServer()).get('/api/accounts').expect(401);
  });
});
