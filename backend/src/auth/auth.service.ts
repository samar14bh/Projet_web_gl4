import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Admin } from '../users/entities/admin.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

interface OtpData {
  code: string;
  email: string;
  expiresAt: Date;
}

interface PendingRegistration {
  dto: RegisterDto;
  imageBuffer?: Buffer;
  imageMimetype?: string;
  imageOriginalName?: string;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private otpStore = new Map<string, OtpData>();
  private pendingRegistrations = new Map<string, PendingRegistration>();

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwt: JwtService,
    private mail: MailService,
  ) {
    setInterval(() => this.cleanExpiredOtps(), 60000);
    setInterval(() => this.cleanExpiredRegistrations(), 60000);
  }

  private cleanExpiredOtps(): void {
    const now = new Date();
    for (const [email, data] of this.otpStore.entries()) {
      if (data.expiresAt < now) {
        this.otpStore.delete(email);
      }
    }
  }

  private cleanExpiredRegistrations(): void {
    const now = new Date();
    for (const [token, data] of this.pendingRegistrations.entries()) {
      if (data.expiresAt < now) {
        this.pendingRegistrations.delete(token);
      }
    }
  }

  async register(dto: RegisterDto, imageFile?: Express.Multer.File) {
    const existingUser = await this.userRepo.findOneBy({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const token = randomUUID();

    let imageUrl: string | undefined;
    if (imageFile) {
      const fs = require('fs').promises;
      const path = require('path');
      
      const uploadsDir = './uploads/profiles';
      await fs.mkdir(uploadsDir, { recursive: true });
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(imageFile.originalname || '.jpg');
      const filename = `profile-${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filepath, imageFile.buffer);
      imageUrl = `http://localhost:3000/uploads/profiles/${filename}`;
    }

    const userData: Partial<User> = {
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: dto.name,
      lastName: dto.lastName,
      major: dto.major,
      dateOfBirth: dto.dateOfBirth,
      image: imageUrl,
      emailVerified: false, 
      emailVerificationToken: token,
      emailVerificationExpires: new Date(Date.now() + 3600000),
    };

    const user = this.userRepo.create(userData);
    const savedUser = await this.userRepo.save(user);

    await this.mail.sendVerificationEmail(dto.email, token);
    
    const { password, emailVerificationToken, refreshToken, ...userWithoutSensitive } = savedUser;
    
    return {
      message: 'Email de vérification envoyé',
      user: {
        ...userWithoutSensitive,
        role: 'USER'
      }
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({
      where: { emailVerificationToken: token }
    });
    
    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Token expiré');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    const savedUser = await this.userRepo.save(user);
    
    const { password, emailVerificationToken, refreshToken, ...userWithoutSensitive } = savedUser;
    
    return { 
      message: 'Email vérifié avec succès', 
      success: true,
      user: {
        ...userWithoutSensitive,
        role: 'USER'
      }
    };
  }

  async login(email: string, password: string) {
    const user: User | null = await this.userRepo.findOneBy({ email });

    if (user) {
      if (!(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      if (!user.emailVerified) {
        throw new UnauthorizedException('Veuillez vérifier votre email avant de vous connecter');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('OTP:',otp);
      this.otpStore.set(email, {
        code: otp,
        email: email,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
      
      await this.mail.sendOtp(user.email, otp);
      
      return { 
        message: 'OTP envoyé', 
        requiresOtp: true,
        email: user.email
      };
    }

    const admin: Admin | null = await this.adminRepo.findOneBy({ email });
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = this.generateTokens(admin.id, 'Admin');
    
    await this.adminRepo.update(admin.id, {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10)
    });

    return {
      ...tokens,
      user: {
        id: admin.id,
        email: admin.email,
        role: 'ADMIN',
        emailVerified: true
      },
      requiresOtp: false
    };
  }

  async verifyOtp(email: string, otp: string) {
    const cleanOtp = otp.trim().replace(/\s/g, '');
    const storedOtp = this.otpStore.get(email);
    
    if (!storedOtp) {
      throw new UnauthorizedException('Code OTP invalide ou expiré');
    }
    
    const now = new Date();
    if (storedOtp.expiresAt < now) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('Code OTP expiré');
    }
    
    if (storedOtp.code !== cleanOtp) {
      throw new UnauthorizedException('Code OTP incorrect');
    }
    
    this.otpStore.delete(email);
    
    const user: User | null = await this.userRepo.findOne({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    
    const tokens = this.generateTokens(user.id, 'User');
    
    await this.userRepo.update(user.id, {
      refreshToken: await bcrypt.hash(tokens.refreshToken, 10)
    });
    
    const { password, emailVerificationToken, refreshToken, ...userWithoutSensitive } = user;

    return {
      ...tokens,
      user: {
        ...userWithoutSensitive,
        role: 'USER'
      }
    };
  }

  generateTokens(id: number, type: 'User' | 'Admin') {
    const payload = { 
      sub: id, 
      type,
      userId: id
    };
    
    const accessToken = this.jwt.sign(payload, { 
      secret: process.env.JWT_SECRET,
      expiresIn: '15m' 
    });
    
    const refreshToken = this.jwt.sign(payload, { 
      secret: process.env.JWT_REFRESH_SECRET, 
      expiresIn: '7d' 
    });
    
    return { accessToken, refreshToken };
  }

  async logout(id: number) {
  if (!id) {
    throw new BadRequestException('ID utilisateur requis');
  }
  
  try {
    const user = await this.userRepo.findOne({ where: { id } });
    
    if (user) {
      await this.userRepo.update(id, { refreshToken: null });
      
      return { 
        message: 'Utilisateur déconnecté avec succès',
        userId: id
      };
    }
    
    const admin = await this.adminRepo.findOne({ where: { id } });
    
    if (admin) {
      await this.adminRepo.update(id, { refreshToken: null });
      
      return { 
        message: 'Admin déconnecté avec succès',
        adminId: id  
      };
    }
    
    throw new NotFoundException(`Utilisateur avec ID ${id} non trouvé`);
    
  } catch (error) {
    throw error;
  }
}

  async refresh(id: number, refreshToken: string) {
    const user: User | null = await this.userRepo.findOneBy({ id });
    
    if (user && user.refreshToken) {
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const tokens = this.generateTokens(user.id, 'User');
      await this.userRepo.update(user.id, {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10)
      });

      const { password, emailVerificationToken, refreshToken: _, ...userWithoutSensitive } = user;

      return {
        ...tokens,
        user: {
          ...userWithoutSensitive,
          role: 'USER'
        }
      };
    }
    
    const admin: Admin | null = await this.adminRepo.findOneBy({ id });
    
    if (admin && admin.refreshToken) {
      const isValid = await bcrypt.compare(refreshToken, admin.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const tokens = this.generateTokens(admin.id, 'Admin');
      await this.adminRepo.update(admin.id, {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10)
      });

      return {
        ...tokens,
        user: {
          id: admin.id,
          email: admin.email,
          role: 'ADMIN',
          emailVerified: true
        }
      };
    }
    
    throw new UnauthorizedException('Refresh token invalide');
  }
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
  const user = await this.userRepo.findOneBy({ email });
  const admin = await this.adminRepo.findOneBy({ email });
  return { exists: !!(user || admin) };
}

}