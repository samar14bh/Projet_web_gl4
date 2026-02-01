import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto'; 
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly uploadPath = './uploads/profiles';

  /**
   * Récupérer tous les utilisateurs
   */
  async findAll() {
    return this.userRepository.find({
      select: ['id', 'name', 'lastName', 'email', 'image'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Récupérer un utilisateur par ID
   */
  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'lastName', 'email', 'image'],
    });
    if (!user) throw new NotFoundException(`Utilisateur ${id} non trouvé`);
    return user;
  }

  

async updateProfile(id: number | string, updateDto: UpdateProfileDto, imageFile?: Express.Multer.File) {
  const user = await this.userRepository.findOneBy({ id: Number(id) });
  if (!user) {
    throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
  }
  let imageUrl = user.image; 
  if (imageFile) {
    await fs.mkdir(this.uploadPath, { recursive: true });
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(imageFile.originalname || '.jpg');
    const filename = `profile-${uniqueSuffix}${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    await fs.writeFile(filepath, imageFile.buffer);

    if (user.image && user.image.includes('/uploads/profiles/')) {
      const oldFilename = user.image.split('/').pop();
      if (oldFilename) {
        await fs.unlink(path.join(this.uploadPath, oldFilename)).catch(() => null);
      }
    }
    imageUrl = `http://localhost:3000/uploads/profiles/${filename}`;
  }
  const { dateOfBirth, password, ...rest } = updateDto as any;
  const parsedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
  Object.assign(user, {
    ...rest,
    ...(parsedDateOfBirth ? { dateOfBirth: parsedDateOfBirth } : {}),
    image: imageUrl,
  });

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }
  const savedUser = await this.userRepository.save(user);

  console.log('Utilisateur sauvegardé:', savedUser);
  const { password: _pwd, refreshToken: _rt, ...userResponse } = savedUser;
  const response = {
    id: userResponse.id,
    email: userResponse.email,
    name: userResponse.name,
    lastName: userResponse.lastName,
    image: userResponse.image,
    major: userResponse.major,
    dateOfBirth: userResponse.dateOfBirth,
    emailVerified: userResponse.emailVerified,
    role: 'USER',
   
  };

  console.log('Réponse envoyée au frontend:', response);
  return response;
}
}