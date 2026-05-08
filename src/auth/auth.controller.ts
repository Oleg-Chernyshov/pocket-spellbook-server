import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginUserDto, CreateUserDto } from '../users/dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthRequest } from './interfaces/auth-request.interface';
import {
  ApiLoginDocs,
  ApiLogoutDocs,
  ApiRefreshDocs,
  ApiRegisterDocs,
} from './swagger/auth.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiLoginDocs()
  async login(@Body() loginDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('register')
  @ApiRegisterDocs()
  async register(@Body() registerDto: CreateUserDto) {
    const user = await this.usersService.create(registerDto);
    return {
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiRefreshDocs()
  async refresh(@Request() req: AuthRequest) {
    const userId = req.user.id;
    const refreshToken = req.user.refreshToken as string;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiLogoutDocs()
  async logout(@Request() req: AuthRequest) {
    const userId = req.user.id;
    return this.authService.logout(userId);
  }
}
