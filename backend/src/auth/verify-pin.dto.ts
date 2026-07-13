import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyPinDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  pin: string;
}
