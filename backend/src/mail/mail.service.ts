import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  // ===============================
  // EMAIL DE VERIFICATION
  // ===============================
  async sendVerificationEmail(email: string, token: string) {
    const backendUrl =
      process.env.BACKEND_URL || 'http://localhost:3000';

    const verificationUrl = `${backendUrl}/api/auth/verify?token=${encodeURIComponent(
      token,
    )}`;

    const textVersion = `
Vérification de votre email - ClubHub

Bonjour,

Merci de vous être inscrit sur ClubHub.
Pour finaliser votre inscription, veuillez vérifier votre adresse email
en utilisant le lien suivant :

${verificationUrl}

Ce lien expirera dans 1 heure.

Si vous n'avez pas créé de compte, veuillez ignorer cet email.

© ${new Date().getFullYear()} ClubHub.
`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification de votre email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      background-color: #f5f5f5;
      line-height: 1.6;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }

    .content {
      background: white;
      padding: 40px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .verification-box {
      text-align: center;
      margin: 30px 0;
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 14px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vérification de votre email</h1>
      <p>Bienvenue sur ClubHub</p>
    </div>

    <div class="content">
      <p>
        Bonjour,<br><br>
        Merci de vous être inscrit sur notre plateforme.
        Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
      </p>

      <div class="verification-box">
        <a href="${verificationUrl}" class="btn" target="_blank">
          Vérifier mon email
        </a>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} ClubHub. Tous droits réservés.
      </div>
    </div>
  </div>
</body>
</html>
`;

    try {
      this.logger.log(`Envoi email de vérification à ${email}`);

      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM, // OBLIGATOIRE : même Gmail
        subject: 'Vérification de votre email - ClubHub',
        html: htmlTemplate,
        text: textVersion,
      });

      this.logger.log(`Email de vérification envoyé à ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Erreur envoi email de vérification à ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  // ===============================
  // EMAIL OTP
  // ===============================
  async sendOtp(email: string, otp: string) {
    const textVersion = `
Code de sécurité OTP - ClubHub

Votre code de vérification est : ${otp}

Ce code est valable pendant 5 minutes.
Ne partagez jamais ce code.

© ${new Date().getFullYear()} ClubHub.
`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Code OTP</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f5f5f5;">
  <div style="max-width:500px;margin:40px auto;background:#fff;padding:30px;border-radius:10px;text-align:center;">
    <h2>Code de sécurité OTP</h2>
    <p>Voici votre code :</p>
    <div style="font-size:36px;font-weight:bold;margin:20px 0;">
      ${otp}
    </div>
    <p>Ce code est valable pendant <strong>5 minutes</strong>.</p>
    <p style="font-size:14px;color:#777;">
      © ${new Date().getFullYear()} ClubHub
    </p>
  </div>
</body>
</html>
`;

    try {
      this.logger.log(`Envoi OTP à ${email}`);

      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM, // Gmail uniquement
        subject: 'Votre code de sécurité OTP - ClubHub',
        html: htmlTemplate,
        text: textVersion,
      });

      this.logger.log(`OTP envoyé à ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur envoi OTP à ${email}`, error.stack);
      throw error;
    }
  }
}
