import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';
import { SendOtpDto } from './send-otp.dto';
import { LoginWithOtpDto } from './login-with-otp.dto';
import { SetPinDto } from './set-pin.dto';
import { VerifyPinDto } from './verify-pin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
    const user = await this.usersService.findOneByEmail(sendOtpDto.email);
    if (!user) throw new NotFoundException('User not found');
    const otp = this.usersService.generateOTP();
    const expires = new Date(Date.now() + 300000); // 5 minutes
    await this.usersService.updateOTP(user.id, otp, expires);
    // TODO: Send OTP via email/SMS
    return { message: 'OTP sent successfully.', otp };
  }

  async loginWithOtp(loginWithOtpDto: LoginWithOtpDto) {
    const user = await this.usersService.findOneByEmail(loginWithOtpDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
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
