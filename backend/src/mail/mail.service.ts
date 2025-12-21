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
      background-color: #f0f9ff;
      line-height: 1.6;
      color: #1e3a8a;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 15px 15px 0 0;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }

    .logo-subtitle {
      font-size: 16px;
      opacity: 0.9;
      position: relative;
      z-index: 2;
    }

    .content {
      background: white;
      padding: 50px 40px;
      border-radius: 0 0 15px 15px;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.1);
    }

    .welcome-text {
      font-size: 18px;
      color: #1e40af;
      margin-bottom: 30px;
      line-height: 1.8;
    }

    .verification-box {
      text-align: center;
      margin: 40px 0;
      padding: 20px;
      background: linear-gradient(135deg, rgba(219, 234, 254, 0.3), rgba(224, 242, 254, 0.3));
      border-radius: 12px;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 45px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      position: relative;
      overflow: hidden;
      border: none;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }

    .info-box {
      background: #f8fafc;
      border-left: 4px solid #60a5fa;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
    }

    .info-title {
      color: #1d4ed8;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .info-text {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.6;
    }

    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    .footer-links {
      margin-top: 20px;
    }

    .footer-link {
      color: #3b82f6;
      text-decoration: none;
      margin: 0 10px;
      font-size: 13px;
    }

    .footer-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .container {
        padding: 0 15px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .header {
        padding: 30px 15px;
      }
      
      .btn {
        padding: 14px 30px;
        width: 100%;
        max-width: 280px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ClubHub</div>
      <div class="logo-subtitle">Votre plateforme de gestion de clubs</div>
    </div>

    <div class="content">
      <p class="welcome-text">
        Bonjour,<br><br>
        Merci de vous être inscrit sur ClubHub. Pour finaliser votre inscription 
        et profiter pleinement de toutes les fonctionnalités, veuillez vérifier 
        votre adresse email en cliquant sur le bouton ci-dessous.
      </p>

      <div class="verification-box">
        <a href="${verificationUrl}" class="btn" target="_blank">
          Vérifier mon email
        </a>
        <p style="margin-top: 15px; color: #6b7280; font-size: 14px;">
          Ce lien est valable pendant 1 heure
        </p>
      </div>

      <div class="info-box">
        <div class="info-title">Pourquoi vérifier votre email ?</div>
        <div class="info-text">
          • Sécuriser votre compte<br>
          • Recevoir les notifications importantes<br>
          • Accéder à toutes les fonctionnalités<br>
          • Retrouver votre compte en cas d'oubli de mot de passe
        </div>
      </div>

      <div class="footer">
        <div>
          © ${new Date().getFullYear()} ClubHub. Tous droits réservés.
        </div>
        <div style="margin-top: 10px; font-size: 13px; color: #9ca3af;">
          Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">Aide</a> • 
          <a href="#" class="footer-link">Contact</a> • 
          <a href="#" class="footer-link">Confidentialité</a>
        </div>
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
        from: process.env.MAIL_FROM,
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code de sécurité OTP</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      line-height: 1.6;
      color: #1e3a8a;
    }

    .container {
      max-width: 500px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 15px 15px 0 0;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }

    .logo {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 5px;
      position: relative;
      z-index: 2;
    }

    .logo-subtitle {
      font-size: 14px;
      opacity: 0.9;
      position: relative;
      z-index: 2;
    }

    .content {
      background: white;
      padding: 40px 30px;
      border-radius: 0 0 15px 15px;
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.1);
      text-align: center;
    }

    .otp-title {
      color: #1d4ed8;
      font-size: 20px;
      margin-bottom: 10px;
    }

    .otp-subtitle {
      color: #6b7280;
      font-size: 15px;
      margin-bottom: 30px;
    }

    .otp-code {
      background: linear-gradient(135deg, rgba(219, 234, 254, 0.4), rgba(224, 242, 254, 0.4));
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 8px;
      padding: 25px;
      border-radius: 12px;
      border: 2px dashed rgba(59, 130, 246, 0.3);
      margin: 30px 0;
      color: #1e40af;
      font-family: 'Courier New', monospace;
    }

    .timer {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0;
    }

    .warning-box {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }

    .warning-title {
      color: #dc2626;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .warning-text {
      color: #7c2d12;
      font-size: 14px;
      line-height: 1.6;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    .footer-note {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 10px;
    }

    @media (max-width: 500px) {
      .container {
        padding: 0 15px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .header {
        padding: 25px 15px;
      }
      
      .otp-code {
        font-size: 32px;
        letter-spacing: 6px;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ClubHub</div>
      <div class="logo-subtitle">Code de sécurité</div>
    </div>

    <div class="content">
      <h2 class="otp-title">Code de vérification</h2>
      <p class="otp-subtitle">Utilisez ce code pour vous connecter à votre compte</p>
      
      <div class="otp-code">${otp}</div>
      
      <div class="timer">⏱️ Valable pendant 5 minutes</div>
      
      <div class="warning-box">
        <div class="warning-title">⚠️ Important</div>
        <div class="warning-text">
          • Ne partagez jamais ce code avec qui que ce soit<br>
          • ClubHub ne vous demandera jamais votre code par email<br>
          • Si vous n'avez pas demandé ce code, ignorez cet email
        </div>
      </div>

      <div class="footer">
        <div>
          © ${new Date().getFullYear()} ClubHub. Tous droits réservés.
        </div>
        <div class="footer-note">
          Cet email a été envoyé automatiquement pour votre sécurité.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

    try {
      this.logger.log(`Envoi OTP à ${email}`);

      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM,
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

  // ===============================
  // EMAIL DE RÉINITIALISATION DE MOT DE PASSE
  // ===============================
  async sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const textVersion = `
Réinitialisation de votre mot de passe - ClubHub

Bonjour,

Vous avez demandé à réinitialiser votre mot de passe.
Cliquez sur le lien suivant pour créer un nouveau mot de passe :

${resetUrl}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.

© ${new Date().getFullYear()} ClubHub.
`;

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    body {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      line-height: 1.6;
      color: #1e3a8a;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    }

    .header {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-radius: 15px 15px 0 0;
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }

    .logo-subtitle {
      font-size: 16px;
      opacity: 0.9;
      position: relative;
      z-index: 2;
    }

    .content {
      background: white;
      padding: 50px 40px;
      border-radius: 0 0 15px 15px;
      box-shadow: 0 10px 30px rgba(30, 58, 138, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.1);
    }

    .reset-box {
      text-align: center;
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, rgba(219, 234, 254, 0.3), rgba(224, 242, 254, 0.3));
      border-radius: 12px;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 45px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(30, 64, 175, 0.4);
      border: none;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(30, 64, 175, 0.5);
    }

    .security-info {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
      text-align: left;
    }

    .security-title {
      color: #92400e;
      font-weight: 600;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .security-text {
      color: #78350f;
      font-size: 14px;
      line-height: 1.6;
    }

    .expiry-notice {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0;
    }

    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
    }

    @media (max-width: 600px) {
      .container {
        padding: 0 15px;
      }
      
      .content {
        padding: 30px 20px;
      }
      
      .header {
        padding: 30px 15px;
      }
      
      .btn {
        padding: 14px 30px;
        width: 100%;
        max-width: 280px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ClubHub</div>
      <div class="logo-subtitle">Sécurité du compte</div>
    </div>

    <div class="content">
      <p style="font-size: 17px; color: #1e40af; margin-bottom: 30px; line-height: 1.8;">
        Bonjour,<br><br>
        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.
        Si vous êtes à l'origine de cette demande, cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </p>

      <div class="reset-box">
        <a href="${resetUrl}" class="btn" target="_blank">
          Réinitialiser mon mot de passe
        </a>
        <div class="expiry-notice">⌛ Valable pendant 1 heure</div>
      </div>

      <div class="security-info">
        <div class="security-title">🔒 Conseils de sécurité</div>
        <div class="security-text">
          • Utilisez un mot de passe unique et fort<br>
          • Activez l'authentification à deux facteurs<br>
          • Ne réutilisez pas vos mots de passe<br>
          • Méfiez-vous des emails suspects
        </div>
      </div>

      <div class="footer">
        <div>
          © ${new Date().getFullYear()} ClubHub. Tous droits réservés.
        </div>
        <div style="margin-top: 15px; font-size: 13px; color: #9ca3af;">
          Si vous n'avez pas demandé cette réinitialisation, votre compte est peut-être compromis.
          Veuillez nous contacter immédiatement.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

    try {
      this.logger.log(`Envoi email de réinitialisation à ${email}`);

      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM,
        subject: 'Réinitialisation de votre mot de passe - ClubHub',
        html: htmlTemplate,
        text: textVersion,
      });

      this.logger.log(`Email de réinitialisation envoyé à ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Erreur envoi email de réinitialisation à ${email}`,
        error.stack,
      );
      throw error;
    }
  }
}