import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReplayProtectionService } from '../services/replay-protection.service';

/**
 * JWT Guard - Protects endpoints with JWT authentication
 * Validates the Authorization Bearer token
 */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly replayProtectionService: ReplayProtectionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;
    const queryToken = typeof request.query?.accessToken === 'string' ? request.query.accessToken : undefined;
    const streamToken =
      typeof request.query?.streamToken === 'string' ? request.query.streamToken : undefined;
    const streamNonce =
      typeof request.query?.nonce === 'string' ? request.query.nonce : undefined;

    const token =
      authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : streamToken ?? queryToken;

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    try {
      const payload = streamToken
        ? this.jwtService.verify(token, {
            secret: process.env.STREAM_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key',
            audience: 'reports-sse',
          })
        : this.jwtService.verify(token);

      if (streamToken && payload?.type !== 'stream') {
        throw new UnauthorizedException('Invalid stream token');
      }

      if (streamToken) {
        if (!payload?.jti || typeof payload.jti !== 'string') {
          throw new UnauthorizedException('Invalid stream token identifier');
        }

        if (!payload?.nonce || typeof payload.nonce !== 'string' || payload.nonce !== streamNonce) {
          throw new UnauthorizedException('Invalid stream nonce');
        }

        const ttlSeconds =
          typeof payload.exp === 'number'
            ? Math.max(1, Math.floor(payload.exp - Date.now() / 1000))
            : 120;
        const accepted = await this.replayProtectionService.consumeStreamTokenJti(
          payload.jti,
          ttlSeconds,
        );
        if (!accepted) {
          throw new UnauthorizedException('Stream token replay detected');
        }
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
