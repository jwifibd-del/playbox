import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginWithOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;
}
