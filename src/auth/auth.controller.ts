import { Controller, Get, Post, UseGuards, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from '@/users/users.interface';

@Controller('auth') //  route /
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage("User login")
  handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @Post('/register')
  @ResponseMessage('Register new user')
  registerNewUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Get('/account')
  @ResponseMessage('Get user information')
  getAccount(@Req() req) {
    return req.user;
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage('Refresh token')
  handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @Post('/logout')
  @ResponseMessage('User log out')
  logOutUser(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.handleLogOut(user, response);
  }
}
