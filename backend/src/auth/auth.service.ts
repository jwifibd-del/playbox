import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { SendOtpDto } from './send-otp.dto';
import { LoginWithOtpDto } from './login-with-otp.dto';
import { SetPinDto } from './set-pin.dto';
import { VerifyPinDto } from './verify-pin.dto';
import { AdminPanelLoginDto } from './admin-panel-login.dto';
import { UpdatePanelPasswordDto } from './update-panel-password.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensurePanelAdminUser();
    } catch (e) {
      // ignore bootstrap errors
    }
  }

  private getPanelCredentials(): { username: string; password: string; email: string } {
    const username = this.configService.get<string>('ADMIN_PANEL_USER') || 'admin';
    const password = this.configService.get<string>('ADMIN_PANEL_PASSWORD') || 'admin';
    const email = this.configService.get<string>('ADMIN_PANEL_EMAIL') || 'admin@playflix.local';
    return { username, password, email };
  }

  async ensurePanelAdminUser() {
    const { email, password } = this.getPanelCredentials();
    const existing = await this.usersService.findOneByEmail(email);
    if (!existing) {
      try {
        const user = await this.usersService.create(email, password, 'PlayFlix Admin');
        await this.usersService.setAdmin(user.id, true);
        return user;
      } catch (e) {
        return null;
      }
    }
    if (!existing.isAdmin) {
      await this.usersService.setAdmin(existing.id, true);
    }
    const isMatch = await bcrypt.compare(password, existing.password);
    if (!isMatch) {
      await this.usersService.updatePassword(existing.id, password);
    }
    return existing;
  }

  async updatePanelPassword(userId: string, dto: UpdatePanelPasswordDto) {
    const panel = this.getPanelCredentials();
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.email !== panel.email) {
      if (!user.isAdmin) throw new ForbiddenException('Only panel admin can update panel password');
    }
    if (!dto.newPassword || dto.newPassword.length < 4) {
      throw new BadRequestException('New password too short');
    }
    await this.usersService.updatePassword(userId, dto.newPassword);
    return { message: 'Panel admin password updated' };
  }

  async loginPanel(dto: AdminPanelLoginDto) {
    const panel = this.getPanelCredentials();
    let user = await this.usersService.findOneByEmail(panel.email);
    if (!user) {
      user = await this.ensurePanelAdminUser();
    }
    if (!user) throw new UnauthorizedException('Admin user unavailable');
    if (dto.username !== panel.username) {
      throw new UnauthorizedException('Invalid admin panel credentials');
    }
    const passwordIsValid =
      (panel.password && dto.password === panel.password) ||
      (await bcrypt.compare(dto.password || '', user.password));
    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid admin panel credentials');
    }
    if (!user.isAdmin) {
      await this.usersService.setAdmin(user.id, true);
    }
    const payload = { email: user.email, sub: user.id, isAdmin: true };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, isAdmin: true },
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findOneByEmail(forgotPasswordDto.email);
    if (!user) {
      return { message: 'If this email exists, you will receive a password reset link.' };
    }
    const token = this.usersService.generateResetToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await this.usersService.updateResetToken(user.id, token, expires);
    // TODO: Send email with reset token
    return { message: 'Password reset link sent.', token };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    if (!user) throw new BadRequestException('Invalid or expired token');
    if (!user.resetPasswordTokenExpires || user.resetPasswordTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.usersService.updatePassword(user.id, resetPasswordDto.newPassword);
    return { message: 'Password reset successfully.' };
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    let user = await this.usersService.findOneByEmail(sendOtpDto.email);
    if (!user) {
      // Create a new user with random password
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await this.usersService.create(
        sendOtpDto.email,
        randomPassword,
        sendOtpDto.email.split('@')[0]
      );
    }
    const otp = this.usersService.generateOTP();
    const expires = new Date(Date.now() + 300000); // 5 minutes
    await this.usersService.updateOTP(user.id, otp, expires);
    // TODO: Send OTP via email/SMS
    return { message: 'OTP sent successfully.', otp };
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    let user = await this.usersService.findOneByEmail(loginWithOtpDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.otp || user.otp !== loginWithOtpDto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new UnauthorizedException('Expired OTP');
    }
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async setPin(userId: string, setPinDto: SetPinDto) {
    await this.usersService.updatePIN(userId, setPinDto.pin);
    return { message: 'PIN set successfully.' };
  }

  async verifyPin(userId: string, verifyPinDto: VerifyPinDto) {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.pin || !user.pinEnabled) throw new BadRequestException('PIN not set');
    const isMatch = await bcrypt.compare(verifyPinDto.pin, user.pin);
    if (!isMatch) throw new UnauthorizedException('Invalid PIN');
    return { message: 'PIN verified successfully.' };
  }
}
