import { Controller, Post, Body, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
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
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin-panel-login')
  loginPanel(@Body() dto: AdminPanelLoginDto) {
    return this.authService.loginPanel(dto);
  }

  @Patch('panel-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updatePanelPassword(@Request() req: any, @Body() dto: UpdatePanelPasswordDto) {
    const userId = req.user?.userId || req.user?.id || req.user?.sub;
    return this.authService.updatePanelPassword(userId, dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('send-otp')
  sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('login-with-otp')
  loginWithOtp(@Body() loginWithOtpDto: LoginWithOtpDto) {
    return this.authService.loginWithOtp(loginWithOtpDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('set-pin')
  @UseGuards(JwtAuthGuard)
  setPin(@Request() req, @Body() setPinDto: SetPinDto) {
    return this.authService.setPin(req.user.userId, setPinDto);
  }

  @Post('verify-pin')
  @UseGuards(JwtAuthGuard)
  verifyPin(@Request() req, @Body() verifyPinDto: VerifyPinDto) {
    return this.authService.verifyPin(req.user.userId, verifyPinDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAdminData() {
    return {
      message: 'Welcome, admin!' };
  }
}
