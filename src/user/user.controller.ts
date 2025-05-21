import { Controller, Post, Body, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { USERS } from './user.db';

interface LoginDto {
  username: string;
  password: string;
}

interface LoginResponse {
  userId: string;
  userType: 'customer' | 'driver';
  username: string;
}

@Controller('user')
export class UserController {
  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto): LoginResponse {
    const user = USERS.find(
      u => u.username === loginDto.username && u.password === loginDto.password
    );

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Return user info without password
    return {
      userId: user.userId,
      userType: user.userType,
      username: user.username
    };
  }
}
