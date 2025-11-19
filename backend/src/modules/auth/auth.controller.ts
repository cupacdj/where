import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; username?: string; name?: string; surname?: string; gender?: 'man' | 'woman'; password: string }) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: { identifier: string; password: string }) {
    return this.auth.login(body.identifier, body.password);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.auth.changePassword(req.user.userId, body.currentPassword, body.newPassword);
  }
}
