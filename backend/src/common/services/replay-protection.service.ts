import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class ReplayProtectionService implements OnModuleDestroy {
  private readonly logger = new Logger(ReplayProtectionService.name);
  private readonly consumedJti = new Map<string, number>();
  private readonly redisUrl = process.env.REDIS_URL;
  private readonly redisPrefix = process.env.REDIS_PREFIX || 'wingrox';

  private redisClient: Redis | null = null;
  private redisAvailable = false;
  private redisConnectAttempted = false;

  private async ensureRedisConnection(): Promise<void> {
    if (this.redisConnectAttempted || !this.redisUrl) {
      return;
    }

    this.redisConnectAttempted = true;

    try {
      this.redisClient = new Redis(this.redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
      });

      await this.redisClient.connect();
      this.redisAvailable = true;
      this.logger.log('Replay protection is using Redis backend');
    } catch {
      this.redisAvailable = false;
      this.redisClient = null;
      this.logger.warn('Redis unavailable, replay protection falling back to in-memory store');
    }
  }

  private pruneLocalConsumedJti(): void {
    const now = Date.now();
    for (const [jti, expMs] of this.consumedJti.entries()) {
      if (expMs <= now) {
        this.consumedJti.delete(jti);
      }
    }
  }

  async consumeStreamTokenJti(jti: string, ttlSeconds: number): Promise<boolean> {
    await this.ensureRedisConnection();

    if (this.redisAvailable && this.redisClient) {
      const key = `${this.redisPrefix}:reports:stream-jti:${jti}`;
      try {
        const response = await this.redisClient.set(key, '1', 'EX', Math.max(1, ttlSeconds), 'NX');
        return response === 'OK';
      } catch {
        this.redisAvailable = false;
        this.logger.warn('Redis replay write failed, using in-memory fallback for this instance');
      }
    }

    this.pruneLocalConsumedJti();
    if (this.consumedJti.has(jti)) {
      return false;
    }

    this.consumedJti.set(jti, Date.now() + Math.max(1, ttlSeconds) * 1000);
    return true;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}