import { Body, Controller, Get, Param, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Put('profile/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Param('id') id: string,
    @Body() updateDto: UpdateProfileDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = await this.usersService.updateProfile(id, updateDto, image);
    return {
      message: 'Profil mis à jour avec succès',
      user
    };
  }
  /**
   * GET /api/users/profile/:id
   * Récupérer le profil d'un utilisateur par ID
   */
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }
  /**
   * GET /api/users
   * Récupérer tous les utilisateurs
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
  
}
