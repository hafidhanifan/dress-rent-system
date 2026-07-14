// src/auth/admin.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * AdminGuard — cek apakah user yang login punya role admin
 * Guard ini JALAN SETELAH JwtAuthGuard, jadi req.user sudah pasti ada
 * (karena JwtAuthGuard sudah memvalidasi token terlebih dahulu)
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Akses ditolak — khusus admin');
    }

    return true;
  }
}
