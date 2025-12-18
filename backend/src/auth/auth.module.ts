import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { Admin } from '../users/entities/admin.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        
        console.log('[AUTH MODULE] 🔑 Configuration JWT Module');
        console.log('[AUTH MODULE] Secret chargé:', secret ? '✅ OUI' : '❌ NON');
        console.log('[AUTH MODULE] Secret (début):', secret?.substring(0, 10) + '...');
        
        if (!secret) {
          throw new Error('JWT_SECRET non défini dans .env');
        }
        
        return {
          secret: secret,
          signOptions: { 
            expiresIn: '15m',
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User, Admin]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {
  constructor() {
    console.log('[AUTH MODULE] ✅ Module initialisé');
  }
}