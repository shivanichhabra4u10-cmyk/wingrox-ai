import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 3 Integration', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const jwt = new JwtService({ secret: process.env.JWT_SECRET || 'your-secret-key' });
    accessToken = jwt.sign({ sub: 'test-user-1', email: 'test@wingrox.ai', role: 'ADMIN' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/reports/summary requires auth', async () => {
    await request(app.getHttpServer()).get('/api/reports/summary').expect(401);
  });

  it('GET /api/reports/summary returns filtered reporting payload with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/summary?range=30d&country=Germany&industry=SaaS&stage=Seed')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('range', '30d');
    expect(res.body.data.filters.country).toBe('Germany');
    expect(Array.isArray(res.body.data.trend)).toBe(true);
  });

  it('GET /api/reports/export/csv returns CSV with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/export/csv?range=7d')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
    expect(String(res.text).split('\n')[0]).toContain('date,pipeline_eur,matches,conversion_rate');
  });

  it('GET /api/reports/export/pdf returns PDF with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/export/pdf?range=7d')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body).toBeTruthy();
  });

  it('GET /api/reports/segments returns segmented analytics with auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reports/segments?range=30d&country=Germany')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.byCountry)).toBe(true);
    expect(Array.isArray(res.body.data.byIndustry)).toBe(true);
    expect(Array.isArray(res.body.data.byStage)).toBe(true);
  });

  it('GET /api/reports/realtime streams one event with auth', async () => {
    const streamTokenRes = await request(app.getHttpServer())
      .get('/api/reports/stream-token')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const streamToken = streamTokenRes.body?.data?.streamToken as string;
    const nonce = streamTokenRes.body?.data?.nonce as string;
    expect(streamToken).toBeTruthy();
    expect(nonce).toBeTruthy();

    const res = await request(app.getHttpServer())
      .get(
        `/api/reports/realtime?once=1&streamToken=${encodeURIComponent(streamToken)}&nonce=${encodeURIComponent(nonce)}`,
      )
      .expect(200);

    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(res.text).toContain('data:');
  });

  it('GET /api/reports/realtime rejects replayed stream token', async () => {
    const streamTokenRes = await request(app.getHttpServer())
      .get('/api/reports/stream-token')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const streamToken = streamTokenRes.body?.data?.streamToken as string;
    const nonce = streamTokenRes.body?.data?.nonce as string;

    await request(app.getHttpServer())
      .get(
        `/api/reports/realtime?once=1&streamToken=${encodeURIComponent(streamToken)}&nonce=${encodeURIComponent(nonce)}`,
      )
      .expect(200);

    await request(app.getHttpServer())
      .get(
        `/api/reports/realtime?once=1&streamToken=${encodeURIComponent(streamToken)}&nonce=${encodeURIComponent(nonce)}`,
      )
      .expect(401);
  });
});
