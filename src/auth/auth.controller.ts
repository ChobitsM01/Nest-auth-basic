import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, RESPONSE_MESSAGE, ResponseMessage } from '@/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterUserDto } from '@/users/dto/create-user.dto';

@Controller('auth') //  route /
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('/register')
  @ResponseMessage('Register new user')
  registerNewUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

}
