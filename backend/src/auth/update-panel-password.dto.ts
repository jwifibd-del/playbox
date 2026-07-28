import { IsString, MinLength } from 'class-validator';

export class UpdatePanelPasswordDto {
  @IsString()
  @MinLength(4)
  newPassword: string;
}
