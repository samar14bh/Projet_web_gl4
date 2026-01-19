import { Controller, Get } from '@nestjs/common';
import { UsersService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users
   * Récupérer tous les utilisateurs
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
