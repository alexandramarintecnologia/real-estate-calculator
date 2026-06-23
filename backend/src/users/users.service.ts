import {
  Injectable,
  ConflictException,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema.js';
import type { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';
import type { BulkCreateUsersDto } from './dto/bulk-create-users.dto.js';
import {
  FindUsersQueryDto,
  UserStatusFilter,
} from './dto/find-users-query.dto.js';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkCreateResult {
  created: number;
  skippedExisting: number;
  skippedDuplicate: number;
  invalid: number;
  expiresAt: Date | null;
  createdUsers: Array<{ email: string; fullName: string }>;
  skippedExistingEmails: string[];
  invalidEmails: string[];
}

const DEFAULT_EXPIRES_IN_MONTHS = 3;

export interface UsersStats {
  total: number;
  active: number;
  expired: number;
  disabled: number;
  expiringSoon: number;
}

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

    const existing = await this.userModel.findOne({
      email: adminEmail.toLowerCase(),
    });
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
    const exists = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (exists) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const hasPassword =
      typeof dto.password === 'string' && dto.password.length > 0;
    const hashedPassword = hasPassword
      ? await bcrypt.hash(dto.password as string, 10)
      : '';

    return this.userModel.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      mustSetPassword: !hasPassword,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });
  }

  /**
   * Crea usuarios en masa a partir de una lista (ej. importada de un CSV).
   * - Ignora los emails que ya existen en la base de datos (no los actualiza).
   * - Ignora duplicados dentro de la misma lista (deja la primera aparición).
   * - Todos los creados quedan con `mustSetPassword: true`, así crean su
   *   contraseña en el primer inicio de sesión, igual que en el alta individual.
   */
  private static readonly BULK_EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  async bulkCreate(dto: BulkCreateUsersDto): Promise<BulkCreateResult> {
    const months = dto.expiresInMonths ?? DEFAULT_EXPIRES_IN_MONTHS;
    const expiresAt = this.computeExpiresAt(months);
    const role = dto.role ?? UserRole.STUDENT;

    // 1) Normalizamos, validamos email y deduplicamos dentro de la propia lista.
    const seen = new Set<string>();
    let skippedDuplicate = 0;
    const invalidEmails: string[] = [];
    const candidates = dto.users
      .map((u) => ({
        email: u.email.trim().toLowerCase().replace(/^mailto:/i, ''),
        fullName: u.fullName.trim(),
        phone: u.phone?.trim() ?? '',
      }))
      .filter((u) => {
        if (!UsersService.BULK_EMAIL_RE.test(u.email)) {
          invalidEmails.push(u.email || '(vacío)');
          return false;
        }
        if (seen.has(u.email)) {
          skippedDuplicate += 1;
          return false;
        }
        seen.add(u.email);
        return true;
      });

    // 2) Una sola consulta para saber qué emails ya existen en la DB.
    const emails = candidates.map((u) => u.email);
    const existing = await this.userModel
      .find({ email: { $in: emails } }, { email: 1 })
      .lean()
      .exec();
    const existingEmails = new Set(existing.map((e) => e.email));

    const toCreate = candidates.filter((u) => !existingEmails.has(u.email));

    // 3) Insertamos solo los nuevos.
    if (toCreate.length > 0) {
      await this.userModel.insertMany(
        toCreate.map((u) => ({
          email: u.email,
          password: '',
          mustSetPassword: true,
          fullName: u.fullName,
          phone: u.phone,
          role,
          isActive: true,
          expiresAt,
        })),
        { ordered: false },
      );
    }

    return {
      created: toCreate.length,
      skippedExisting: existingEmails.size,
      skippedDuplicate,
      invalid: invalidEmails.length,
      expiresAt,
      createdUsers: toCreate.map((u) => ({
        email: u.email,
        fullName: u.fullName,
      })),
      skippedExistingEmails: [...existingEmails],
      invalidEmails,
    };
  }

  /**
   * Devuelve la fecha de expiración a `months` meses, al final del día en hora
   * de Colombia (UTC-5), o null si months es 0. Coincide con el alta individual,
   * que guarda `...T23:59:59.999-05:00`, sin depender de la zona del servidor.
   */
  private computeExpiresAt(months: number): Date | null {
    if (!months || months <= 0) return null;

    // Fecha actual en hora de Colombia (no usa horario de verano: siempre UTC-5).
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const year = Number(parts.find((p) => p.type === 'year')?.value);
    const month = Number(parts.find((p) => p.type === 'month')?.value); // 1-12
    const day = Number(parts.find((p) => p.type === 'day')?.value);

    // Sumamos meses de calendario, ajustando el desbordamiento de año.
    const zeroBased = month - 1 + months;
    const targetYear = year + Math.floor(zeroBased / 12);
    const targetMonth = (zeroBased % 12) + 1; // 1-12

    // Limitamos al último día del mes destino (ej. 31 ene + 1 mes → 28/29 feb).
    const lastDay = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    const targetDay = Math.min(day, lastDay);

    const mm = String(targetMonth).padStart(2, '0');
    const dd = String(targetDay).padStart(2, '0');
    return new Date(`${targetYear}-${mm}-${dd}T23:59:59.999-05:00`);
  }

  async findAll(
    query: FindUsersQueryDto = {},
  ): Promise<PaginatedResult<UserDocument>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = this.buildFilter(query);

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getStats(): Promise<UsersStats> {
    const now = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

    const [total, disabled, expired, active, expiringSoon] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: false }),
      this.userModel.countDocuments({
        isActive: true,
        expiresAt: { $ne: null, $lte: now },
      }),
      this.userModel.countDocuments({
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      }),
      this.userModel.countDocuments({
        isActive: true,
        expiresAt: { $gt: now, $lte: fifteenDaysFromNow },
      }),
    ]);

    return { total, active, expired, disabled, expiringSoon };
  }

  private buildFilter(query: FindUsersQueryDto): FilterQuery<UserDocument> {
    const filter: FilterQuery<UserDocument> = {};
    const now = new Date();

    if (query.search && query.search.trim().length > 0) {
      const escaped = query.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ email: regex }, { fullName: regex }];
    }

    switch (query.status) {
      case UserStatusFilter.ACTIVE:
        filter.isActive = true;
        filter.$and = [
          ...(filter.$and ?? []),
          {
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
          },
        ];
        break;
      case UserStatusFilter.EXPIRING_SOON: {
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
        filter.isActive = true;
        filter.expiresAt = { $gt: now, $lte: fifteenDaysFromNow };
        break;
      }
      case UserStatusFilter.EXPIRED:
        filter.isActive = true;
        filter.expiresAt = { $ne: null, $lte: now };
        break;
      case UserStatusFilter.DISABLED:
        filter.isActive = false;
        break;
      case UserStatusFilter.ALL:
      default:
        break;
    }

    return filter;
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
      update.mustSetPassword = false;
    }

    if (dto.expiresAt !== undefined) {
      update.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }

    const user = await this.userModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async resetPassword(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { password: '', mustSetPassword: true },
      { new: true },
    );
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async setPassword(id: string, rawPassword: string): Promise<UserDocument> {
    const hashed = await bcrypt.hash(rawPassword, 10);
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { password: hashed, mustSetPassword: false },
      { new: true },
    );
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
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      expiresAt: user.expiresAt,
      lastLoginAt: user.lastLoginAt,
      mustSetPassword: user.mustSetPassword ?? false,
      createdAt: (user as any).createdAt,
    };
  }
}
