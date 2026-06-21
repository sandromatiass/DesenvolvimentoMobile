import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token de reset é obrigatório' })
  resetToken!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  password!: string;

  @IsString()
  @MinLength(8, { message: 'Confirmação de senha deve ter no mínimo 8 caracteres' })
  confirmPassword!: string;
}
