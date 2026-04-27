import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Phase 4 Integration', () => {
  let app: INestApplication;
  let adminAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    const jwt = new JwtService({ secret: process.env.JWT_SECRET || 'your-secret-key' });
    adminAccessToken = jwt.sign({ sub: 'phase4-admin', email: 'admin@wingrox.ai', role: 'ADMIN' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('persists twin assessment and surfaces it in reports aggregates', async () => {
    const uniqueId = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const email = `phase4-${uniqueId}@wingrox.ai`;
    const country = 'Germany';
    const industry = 'Industrial SaaS';
    const stage = 'Growth Stage';

    const sendOtpRes = await request(app.getHttpServer())
      .post('/api/twin-assessment/otp/send')
      .send({ email, packageKey: 'apex' })
      .expect(201);

    expect(sendOtpRes.body.success).toBe(true);
    expect(sendOtpRes.body.data.demoOtp).toMatch(/^\d{6}$/);

    const verifyRes = await request(app.getHttpServer())
      .post('/api/twin-assessment/otp/verify')
      .send({ email, code: sendOtpRes.body.data.demoOtp })
      .expect(201);

    const sessionToken = verifyRes.body?.data?.sessionToken as string;
    expect(sessionToken).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/twin-assessment/complete')
      .send({
        sessionToken,
        packageKey: 'apex',
        company: {
          name: 'Phase 4 Diagnostics GmbH',
          email,
          country,
          industry,
          stage,
        },
        answers: {
          D1: 4,
          D2: 4,
          D3: 3,
          D4: 3,
          D5: 4,
          D6: 3,
        },
        report: {
          summary: {
            strategicPriority: 'Expansion',
            planningHorizon: '12 months',
          },
        },
        metadata: {
          source: 'phase4-integration-test',
        },
      })
      .expect(201);

    const summaryRes = await request(app.getHttpServer())
      .get(
        `/api/reports/summary?range=30d&country=${encodeURIComponent(country)}&industry=${encodeURIComponent(industry)}&stage=${encodeURIComponent(stage)}`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(summaryRes.body.success).toBe(true);
    expect(summaryRes.body.data.filters.country).toBe(country);
    expect(summaryRes.body.data.totals.pipelineEur).toBeGreaterThanOrEqual(499);
    expect(summaryRes.body.data.totals.matches).toBeGreaterThanOrEqual(1);

    const csvRes = await request(app.getHttpServer())
      .get(
        `/api/reports/export/csv?range=30d&country=${encodeURIComponent(country)}&industry=${encodeURIComponent(industry)}&stage=${encodeURIComponent(stage)}`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.headers['content-disposition']).toContain('wingrox-report-30d.csv');
    expect(csvRes.text).toContain('date,pipeline_eur,matches,conversion_rate');
    expect(csvRes.text).toContain(today);

    const pdfRes = await request(app.getHttpServer())
      .get(
        `/api/reports/export/pdf?range=30d&country=${encodeURIComponent(country)}&industry=${encodeURIComponent(industry)}&stage=${encodeURIComponent(stage)}`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    expect(pdfRes.headers['content-type']).toContain('application/pdf');
    expect(pdfRes.headers['content-disposition']).toContain('wingrox-report-30d.pdf');
    expect(Buffer.isBuffer(pdfRes.body)).toBe(true);
    expect((pdfRes.body as Buffer).subarray(0, 4).toString()).toBe('%PDF');
    expect((pdfRes.body as Buffer).length).toBeGreaterThan(500);

    const segmentsRes = await request(app.getHttpServer())
      .get(
        `/api/reports/segments?range=30d&country=${encodeURIComponent(country)}&industry=${encodeURIComponent(industry)}&stage=${encodeURIComponent(stage)}`,
      )
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(200);

    expect(segmentsRes.body.success).toBe(true);
    expect(Array.isArray(segmentsRes.body.data.byCountry)).toBe(true);
    expect(segmentsRes.body.data.byCountry.some((item: { key: string }) => item.key === country)).toBe(true);
    expect(segmentsRes.body.data.byIndustry.some((item: { key: string }) => item.key === industry)).toBe(true);
    expect(segmentsRes.body.data.byStage.some((item: { key: string }) => item.key === stage)).toBe(true);
  });
});
