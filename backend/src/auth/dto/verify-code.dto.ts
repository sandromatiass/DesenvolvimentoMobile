import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'O código deve ter exatamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'O código deve conter apenas dígitos numéricos' })
  code!: string;
}
