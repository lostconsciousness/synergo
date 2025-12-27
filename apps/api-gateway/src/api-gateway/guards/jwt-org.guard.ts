import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { OrgJwtPayload } from '../interfaces/org-jwt-payload.interface';

@Injectable()
export class OrgAccessGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractOrgTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No OrgAccessToken provided');
    }

    try {
      const payload = this.jwtService.verify<OrgJwtPayload>(token);
      request['orgUser'] = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired OrgAccessToken');
    }
  }

  private extractOrgTokenFromHeader(request: Request): string | null {
    // Проверяем заголовок x-org-access-token
    const orgToken = request.headers['x-org-access-token'];
    if (orgToken && !Array.isArray(orgToken)) {
      return orgToken;
    }

    // Проверяем стандартный Authorization заголовок с префиксом "Bearer "
    const authHeader = request.headers['authorization'];
    if (authHeader && !Array.isArray(authHeader)) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) {
        return token;
      }
    }

    return null;
  }
}