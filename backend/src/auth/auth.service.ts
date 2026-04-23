import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Tu cuenta está desactivada. Contacta al administrador.');
    }

    if (user.expiresAt && new Date() > user.expiresAt) {
      throw new ForbiddenException(
        'Tu acceso a la plataforma ha expirado. Contacta al administrador para renovarlo.',
      );
    }

    await this.usersService.updateLastLogin(user._id?.toString() ?? '');

    const payload: JwtPayload = {
      sub: user._id?.toString() ?? '',
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.sanitize(user),
    };
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!this.usersService.isAccessValid(user)) {
      throw new ForbiddenException(
        'Tu acceso ha expirado o fue desactivado. Vuelve a iniciar sesión.',
      );
    }

    return user;
  }
}
