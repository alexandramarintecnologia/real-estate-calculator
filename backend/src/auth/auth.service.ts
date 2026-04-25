import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import type { UserDocument } from '../users/schemas/user.schema.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SetInitialPasswordDto } from './dto/set-initial-password.dto.js';
import type { CheckNewUserDto } from './dto/check-new-user.dto.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const PASSWORD_NOT_SET_CODE = 'PASSWORD_NOT_SET';

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

    if (user.mustSetPassword) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PRECONDITION_REQUIRED,
          code: PASSWORD_NOT_SET_CODE,
          message: 'Debes crear tu contraseña para acceder por primera vez.',
          email: user.email,
        },
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    this.ensureAccessValid(user);

    return this.issueSession(user);
  }

  async checkNewUser(dto: CheckNewUserDto) {
    const notFoundMessage =
      'No encontramos tu cuenta. Verifica con el administrador que ya haya sido creada.';

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(notFoundMessage);
    }

    if (!user.mustSetPassword) {
      throw new BadRequestException(
        'Esta cuenta ya tiene una contraseña configurada. Inicia sesión con tu contraseña.',
      );
    }

    this.ensureAccessValid(user);

    return {
      email: user.email,
      fullName: user.fullName,
    };
  }

  async setInitialPassword(dto: SetInitialPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.mustSetPassword) {
      throw new BadRequestException(
        'Este usuario ya tiene una contraseña configurada. Inicia sesión normalmente.',
      );
    }

    this.ensureAccessValid(user);

    const id = user._id?.toString() ?? '';
    const updated = await this.usersService.setPassword(id, dto.password);
    return this.issueSession(updated);
  }

  async validateUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (user.mustSetPassword) {
      throw new UnauthorizedException(
        'Tu contraseña fue restablecida. Vuelve a iniciar sesión para crearla de nuevo.',
      );
    }

    if (!this.usersService.isAccessValid(user)) {
      throw new ForbiddenException(
        'Tu acceso ha expirado o fue desactivado. Vuelve a iniciar sesión.',
      );
    }

    return user;
  }

  private ensureAccessValid(user: UserDocument) {
    if (!user.isActive) {
      throw new ForbiddenException(
        'Tu cuenta está desactivada. Contacta al administrador.',
      );
    }

    if (user.expiresAt && new Date() > user.expiresAt) {
      throw new ForbiddenException(
        'Tu acceso a la plataforma ha expirado. Contacta al administrador para renovarlo.',
      );
    }
  }

  private async issueSession(user: UserDocument) {
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
}
