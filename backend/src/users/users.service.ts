import {
  Injectable,
  ConflictException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema.js';
import type { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    const adminPassword = this.config.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) return;

    const existing = await this.userModel.findOne({ email: adminEmail.toLowerCase() });
    if (existing) return;

    const hashed = await bcrypt.hash(adminPassword, 10);
    await this.userModel.create({
      email: adminEmail.toLowerCase(),
      password: hashed,
      fullName: 'Administrador',
      role: UserRole.ADMIN,
      isActive: true,
      expiresAt: null,
    });

    this.logger.log(`Admin user created: ${adminEmail}`);
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (exists) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashed,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const update: Record<string, unknown> = { ...dto };

    if (dto.password) {
      update.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.expiresAt !== undefined) {
      update.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Usuario no encontrado');
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  }

  isAccessValid(user: UserDocument): boolean {
    if (!user.isActive) return false;
    if (user.expiresAt && new Date() > user.expiresAt) return false;
    return true;
  }

  sanitize(user: UserDocument) {
    return {
      id: user._id?.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      expiresAt: user.expiresAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: (user as any).createdAt,
    };
  }
}
