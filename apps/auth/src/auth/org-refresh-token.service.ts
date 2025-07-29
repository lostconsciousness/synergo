import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class OrgRefreshTokenService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private getKey(userId: string, orgId: string) {
    return `refresh:${userId}:org:${orgId}`;
  }

  async save(userId: string, orgId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.redis.set(this.getKey(userId, orgId), hash, 'EX', 60 * 60 * 24 * 7);
  }

  async validate(userId: string, orgId: string, token: string): Promise<boolean> {
    const stored = await this.redis.get(this.getKey(userId, orgId));
    if (!stored) return false;
    return bcrypt.compare(token, stored);
  }

  async revoke(userId: string, orgId: string) {
    await this.redis.del(this.getKey(userId, orgId));
  }
}