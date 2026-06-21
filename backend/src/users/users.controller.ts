import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';
import { BulkCreateUsersDto } from './dto/bulk-create-users.dto.js';
import { FindUsersQueryDto } from './dto/find-users-query.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from './schemas/user.schema.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.usersService.sanitize(user);
  }

  @Post('bulk')
  async bulkCreate(@Body() dto: BulkCreateUsersDto) {
    return this.usersService.bulkCreate(dto);
  }

  @Get()
  async findAll(@Query() query: FindUsersQueryDto) {
    const result = await this.usersService.findAll(query);
    return {
      ...result,
      data: result.data.map((u) => this.usersService.sanitize(u)),
    };
  }

  @Get('stats')
  async stats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return this.usersService.sanitize(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    return this.usersService.sanitize(user);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    const user = await this.usersService.resetPassword(id);
    return this.usersService.sanitize(user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }
}
