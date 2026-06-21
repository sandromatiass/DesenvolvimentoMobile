import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: this.config.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetCode(
    to: string,
    name: string,
    code: string,
  ): Promise<void> {
    const html = this.buildResetCodeTemplate(name, code);

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM'),
        to,
        subject: 'Código de Redefinição de Senha — Delivery Tools',
        html,
      });
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${to}`, error);
      throw new InternalServerErrorException('Falha ao enviar e-mail de recuperação');
    }
  }

  private buildResetCodeTemplate(name: string, code: string): string {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redefinição de Senha</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: #1a1a1a; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header { background-color: #F97316; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .header span { font-size: 32px; display: block; margin-bottom: 8px; }
    .body { padding: 40px; }
    .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 16px; }
    .text { font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 24px; }
    .code-box { background-color: #FFF7ED; border: 2px solid #F97316; border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0; }
    .code { font-size: 52px; font-weight: 700; color: #F97316; letter-spacing: 10px; display: block; }
    .expiry { font-size: 13px; color: #EF4444; margin-top: 12px; font-weight: 600; }
    .warning { font-size: 13px; color: #6B7280; line-height: 1.6; margin-top: 24px; padding: 16px; background: #F9FAFB; border-radius: 8px; border-left: 4px solid #E5E7EB; }
    .footer { padding: 24px 40px; border-top: 1px solid #E5E7EB; text-align: center; background: #FAFAFA; }
    .footer p { font-size: 12px; color: #9CA3AF; line-height: 1.6; }
    .footer strong { color: #F97316; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span>🍽</span>
      <h1>Delivery Tools</h1>
    </div>
    <div class="body">
      <p class="greeting">Olá, <strong>${name}</strong>!</p>
      <p class="text">
        Recebemos uma solicitação para redefinir a senha da sua conta no
        <strong>Cardápio Digital</strong>. Use o código abaixo para continuar
        com a redefinição:
      </p>
      <div class="code-box">
        <span class="code">${code}</span>
        <p class="expiry">⏰ Este código expira em 10 minutos</p>
      </div>
      <p class="text">
        Digite este código na tela de verificação do aplicativo para prosseguir
        com a criação de uma nova senha.
      </p>
      <div class="warning">
        <strong>Não solicitou a redefinição?</strong> Ignore este e-mail com
        segurança. Sua senha permanecerá inalterada e nenhuma ação será tomada.
      </div>
    </div>
    <div class="footer">
      <p>© 2024 <strong>Delivery Tools</strong>. Todos os direitos reservados.</p>
      <p>Este é um e-mail automático — por favor, não responda.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}
