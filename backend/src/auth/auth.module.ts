import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';

import { User } from '../users/entities/user.entity';
import { Admin } from '../users/entities/admin.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule, 
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET non défini dans .env');
        }

        return {
          secret,
          signOptions: {
            expiresIn: '60m',
          },
        };
      },
    }),

    TypeOrmModule.forFeature([User, Admin]),
    MailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy, 
  ],

  exports: [
    AuthService,
    JwtModule,
  ],
})
export class AuthModule {
  constructor() {
    console.log('[AUTH MODULE] Module initialisé');
  }
}
