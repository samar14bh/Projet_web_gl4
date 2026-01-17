// jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: Starting authentication check...');
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('Authorization Header:', authHeader?.substring(0, 50) + '...');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JwtAuthGuard handleRequest:', { 
      hasError: !!err, 
      hasUser: !!user, 
      info: info,
      user: user 
    });
    
    if (err || !user) {
      console.error('Authentication failed:', { err, info });
      throw err || new UnauthorizedException('Token invalide');
    }
    
    console.log('Authentication successful, user:', user);
    return user;
  }
}