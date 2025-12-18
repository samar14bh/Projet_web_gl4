import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
     const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const verificationUrl = `${backendUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;
    const textVersion = `
      Vérification de votre email - ClubHub
      
      Bonjour,
      
      Merci de vous être inscrit sur ClubHub. Pour finaliser votre inscription,
      veuillez vérifier votre adresse email en utilisant le lien suivant :
      
     
      
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
          
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .content {
            background: white;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .welcome-text {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555;
          }
          
          .verification-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 5px 5px 0;
            text-align: center;
          }
          
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 50px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: all 0.3s ease;
          }
          
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
          
          .details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 25px 0;
            font-size: 14px;
            color: #666;
            word-break: break-all;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
            font-size: 14px;
          }
          
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
          }
          
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          @media (max-width: 600px) {
            .container {
              padding: 10px;
            }
            
            .content {
              padding: 20px;
            }
            
            .header {
              padding: 20px 10px;
            }
            
            .btn {
              display: block;
              margin: 20px auto;
              padding: 12px 25px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ClubHub</div>
            <h1>Vérification de votre email</h1>
            <p>Bienvenue dans notre communauté</p>
          </div>
          
          <div class="content">
            <p class="welcome-text">
              Bonjour,<br><br>
              Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription et accéder à toutes les fonctionnalités, 
              veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
            </p>
            
            <div class="verification-box">
              <p style="margin-bottom: 15px; font-weight: bold;">
                Cliquez sur le bouton pour vérifier votre compte :
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block;
                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: #ffffff !important;
                              text-decoration: none !important;
                              padding: 15px 40px;
                              border-radius: 50px;
                              font-weight: bold;
                              font-size: 16px;
                              text-align: center;
                              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                              line-height: 1.5;
                              mso-hide: all;"
                       target="_blank">
                      Vérifier mon email
                    </a>
                  </td>
                </tr>
              </table>
              
             
            <div class="warning">
              ⚠️ <strong>Important :</strong> Ce lien de vérification expirera dans 1 heure. 
              Si vous ne cliquez pas avant cette date, vous devrez demander un nouveau lien.
            </div>
            
            <div class="footer">
              <p>
                Si vous n'avez pas créé de compte sur notre plateforme, veuillez ignorer cet email.<br>
                Ceci est un email automatique, merci de ne pas y répondre.
              </p>
              <p style="margin-top: 20px;">
                © ${new Date().getFullYear()} ClubHub. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`Envoi d'email de vérification à : ${email}`);
      console.log(`URL de vérification: ${verificationUrl}`);
      
      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM || '"MonApplication" <noreply@votredomaine.com>',
        subject: 'Vérification de votre email - ClubHub',
        html: htmlTemplate,
        text: textVersion,
      });
      
      console.log(`Email envoyé avec succès à ${email}`);
      return { success: true };
      
    } catch (error) {
      console.error(' Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  async sendOtp(email: string, otp: string) {
    const textVersion = `
      Code de sécurité OTP -ClubHub
      
      Voici votre code de vérification à usage unique : ${otp}
      
      Ce code OTP est valable pendant 5 minutes.
      Ne partagez jamais ce code avec qui que ce soit.
      
      Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
      
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
            background-color: #f5f5f5;
            line-height: 1.6;
            color: #333;
          }
          
          .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 25px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          
          .content {
            background: white;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            letter-spacing: 10px;
            background: linear-gradient(135deg, #4CAF50, #2196F3);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin: 30px 0;
            padding: 20px;
            border: 2px dashed #4CAF50;
            border-radius: 10px;
            display: inline-block;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
            font-size: 14px;
          }
          
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Code de sécurité OTP</h1>
            <p>Utilisez ce code pour vous connecter</p>
          </div>
          
          <div class="content">
            <p style="margin-bottom: 20px; font-size: 16px;">
              Voici votre code de vérification à usage unique :
            </p>
            
            <div class="otp-code">
              ${otp}
            </div>
            
            <div class="warning">
              ⏰ Ce code OTP est valable pendant <strong>5 minutes</strong>.<br>
              Ne partagez jamais ce code avec qui que ce soit.
            </div>
            
            <p style="margin-top: 20px; color: #666;">
              Si vous n'avez pas demandé ce code, veuillez ignorer cet email.
            </p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} ClubHub. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log(`Envoi d'OTP à : ${email}`);
      
      await this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_FROM || '"ClubHub" <noreply@votredomaine.com>',
        subject: 'Votre code de sécurité OTP - ClubHub',
        html: htmlTemplate,
        text: textVersion,
      });
      
      console.log(`OTP envoyé avec succès à ${email}`);
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'OTP:', error);
      throw error;
    }
  }
}