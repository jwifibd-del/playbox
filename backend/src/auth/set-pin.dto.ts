import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SetPinDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  pin: string;
}
