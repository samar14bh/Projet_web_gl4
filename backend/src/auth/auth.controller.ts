import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('register-with-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), 
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Format d\'image non supporté'), false);
        }
        callback(null, true);
      },
    }),
  )
  async registerWithImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
        fileIsRequired: false,
      }),
    ) image: Express.Multer.File | undefined,
    @Body() body: any,
  ) {
    const dto: RegisterDto = {
      email: body.email,
      password: body.password,
      name: body.name,
      lastName: body.lastName,
      major: body.major,
      dateOfBirth: body.dateOfBirth,
    };

    if (!dto.email || !dto.password || !dto.name || !dto.lastName || !dto.major || !dto.dateOfBirth) {
      throw new BadRequestException('Tous les champs obligatoires doivent être remplis');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
    }

    return this.auth.register(dto, image);
  }

  @Get('verify-error')
  @Header('Content-Type', 'text/html')
  verifyError(@Query('message') message: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    return res.redirect(
      `${frontendUrl}/verify-error${message ? '?message=' + encodeURIComponent(message) : ''}`
    );
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    try {
      const result = await this.auth.verifyEmail(body.token);
      
      return {
        ...result,
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/verify-success`
      };
      
    } catch (error) {
      throw error;
    }
  }

  @Get('verify')
  async verifyAndRedirect(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL;
    
    try {
      await this.auth.verifyEmail(token);
      return res.redirect(`${frontendUrl}/verify-success`);
      
    } catch (error) {
      return res.redirect(
        `${frontendUrl}/verify-error?message=${encodeURIComponent(error.message)}`
      );
    }
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.email, dto.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@Req() req, @Body() dto: RefreshTokenDto) {
    return this.auth.refresh(req.user.userId, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    if (!req.user?.userId) {
      throw new BadRequestException('Utilisateur non authentifié');
    }
    
    return this.auth.logout(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin-only')
  adminRoute() {
    return { message: 'Admin OK' };
  }
  @Get('check-email')
async checkEmail(@Query('email') email: string) {
  return this.auth.checkEmailExists(email);
}
}