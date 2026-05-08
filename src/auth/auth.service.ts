import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';

interface UserPayload {
  id: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto) {
    return this.usersService.validateUser(loginUserDto);
  }

  async login(user: UserPayload) {
    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    // Проверяем соответствие refresh-токена
    const refreshTokenMatches = await bcrypt.compare(
      this.digestRefreshToken(refreshToken),
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.issueTokens(user);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Выход выполнен успешно' };
  }

  private async issueTokens(user: UserPayload) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      jti: randomUUID(),
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    const hashedRefreshToken = await bcrypt.hash(
      this.digestRefreshToken(refreshToken),
      10,
    );
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  private digestRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
}
