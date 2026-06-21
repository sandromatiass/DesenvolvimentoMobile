import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { PasswordReset } from '../password-resets/entities/password-reset.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface UserPublic {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPublic;
}

export interface ResetTokenResponse {
  resetToken: string;
}

export interface MessageResponse {
  message: string;
}

interface ResetJwtPayload {
  sub: string;
  resetId: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly CODE_EXPIRY_MINUTES = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(PasswordReset)
    private readonly pwdResetRepo: Repository<PasswordReset>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('As senhas não coincidem');
    }

    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashed = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });
    const saved = await this.usersRepo.save(user);

    return {
      accessToken: this.generateAccessToken(saved.id, saved.email),
      user: { id: saved.id, name: saved.name, email: saved.email },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'name', 'email', 'password'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      accessToken: this.generateAccessToken(user.id, user.email),
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponse> {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });

    if (user) {
      const code = this.generateNumericCode();
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

      const reset = this.pwdResetRepo.create({
        userId: user.id,
        code,
        expiresAt,
        used: false,
      });
      await this.pwdResetRepo.save(reset);
      await this.mailService.sendPasswordResetCode(user.email, user.name, code);
    }

    return { message: 'Código enviado para o e-mail' };
  }

  async verifyCode(dto: VerifyCodeDto): Promise<ResetTokenResponse> {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Código inválido ou expirado');
    }

    const reset = await this.pwdResetRepo.findOne({
      where: { userId: user.id, code: dto.code, used: false },
      order: { createdAt: 'DESC' },
    });

    if (!reset || reset.expiresAt < new Date()) {
      throw new UnauthorizedException('Código inválido ou expirado');
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, resetId: reset.id },
      {
        secret: this.config.get<string>('JWT_RESET_SECRET'),
        expiresIn: this.config.get<string>('JWT_RESET_EXPIRES_IN'),
      },
    );

    return { resetToken };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponse> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('As senhas não coincidem');
    }

    let payload: ResetJwtPayload;
    try {
      payload = this.jwtService.verify<ResetJwtPayload>(dto.resetToken, {
        secret: this.config.get<string>('JWT_RESET_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token de reset inválido ou expirado');
    }

    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const reset = await this.pwdResetRepo.findOne({ where: { id: payload.resetId } });
    if (!reset || reset.used) {
      throw new UnauthorizedException('Token de reset inválido ou já utilizado');
    }

    const hashed = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    await this.usersRepo.update(user.id, { password: hashed });
    await this.pwdResetRepo.update(reset.id, { used: true });

    return { message: 'Senha atualizada com sucesso' };
  }

  async getProfile(userId: string): Promise<UserPublic> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return { id: user.id, name: user.name, email: user.email };
  }

  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  private generateNumericCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
