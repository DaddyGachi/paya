import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from './enums/role.enum';
import { AuthMailService } from './mail/auth-mail.service';

const BCRYPT_SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authMailService: AuthMailService,
  ) {}

  async register(
    dto: RegisterDto,
    context: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.userRepository.save(
      this.userRepository.create({
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.USER,
      }),
    );

    const tokens = await this.issueTokenPair(user, context);
    return { user: this.toSafeUser(user), tokens };
  }

  async login(
    dto: LoginDto,
    context: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.issueTokenPair(user, context);
    return { user: this.toSafeUser(user), tokens };
  }

  async refresh(
    refreshToken: string,
    context: { userAgent?: string; ipAddress?: string } = {},
  ): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findOne({ where: { tokenHash } });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({ where: { id: stored.userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    stored.revoked = true;
    const tokens = await this.issueTokenPair(user, context);
    stored.replacedByTokenHash = this.hashToken(tokens.refreshToken);
    await this.refreshTokenRepository.save(stored);

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.update({ tokenHash }, { revoked: true });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update({ userId, revoked: false }, { revoked: true });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });

    // Always behave the same way regardless of whether the account exists,
    // to avoid leaking which emails are registered.
    if (!user) {
      this.logger.debug(`Password reset requested for unknown email: ${email}`);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    await this.passwordResetTokenRepository.save(
      this.passwordResetTokenRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      }),
    );

    await this.authMailService.sendPasswordResetEmail(user.email, rawToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const resetToken = await this.passwordResetTokenRepository.findOne({ where: { tokenHash } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    const user = await this.userRepository.findOne({ where: { id: resetToken.userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepository.save(user);

    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    // A password reset invalidates every existing session for safety.
    await this.logoutAll(user.id);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.userRepository.save(user);
    await this.logoutAll(user.id);
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.toSafeUser(user);
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.delete({ expiresAt: LessThan(now) });
    await this.passwordResetTokenRepository.delete({ expiresAt: LessThan(now) });
  }

  private async issueTokenPair(
    user: User,
    context: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const accessTokenTtl = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenTtl,
      },
    );

    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      }),
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.parseExpiryToSeconds(accessTokenTtl),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiryToSeconds(expiresIn: string): number {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return 900;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}
