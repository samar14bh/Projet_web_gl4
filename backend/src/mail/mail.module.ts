import { Module, Logger } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('MailModule');
        
        const mailConfig = {
          transport: {
            host: configService.get('MAIL_HOST', 'in-v3.mailjet.com'),
            port: configService.get('MAIL_PORT', 587),
            secure: false,
            auth: {
              user: configService.get('MAIL_USER'),
              pass: configService.get('MAIL_PASSWORD'),
            },
            tls: {
              rejectUnauthorized: false
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
          },
          defaults: {
            from: configService.get('MAIL_FROM', 'hiba.chabbouh@insat.ucar.tn'),
          },
        };

        // Log de debug
        logger.log(`Mail configured with host: ${mailConfig.transport.host}`);
        logger.log(`Mail port: ${mailConfig.transport.port}`);
        
        if (!mailConfig.transport.auth.user) {
          logger.warn('MAIL_USER is not set in environment variables');
        }
        
        if (!mailConfig.transport.auth.pass) {
          logger.warn('MAIL_PASSWORD is not set in environment variables');
        }

        return mailConfig;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}