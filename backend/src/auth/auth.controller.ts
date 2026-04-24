import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { SetInitialPasswordDto } from './dto/set-initial-password.dto.js';
import { CheckNewUserDto } from './dto/check-new-user.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { UsersService } from '../users/users.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('check-new-user')
  @HttpCode(HttpStatus.OK)
  async checkNewUser(@Body() dto: CheckNewUserDto) {
    return this.authService.checkNewUser(dto);
  }

  @Post('set-initial-password')
  @HttpCode(HttpStatus.OK)
  async setInitialPassword(@Body() dto: SetInitialPasswordDto) {
    return this.authService.setInitialPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: { id: string }) {
    const full = await this.usersService.findById(user.id);
    return this.usersService.sanitize(full);
  }
}
