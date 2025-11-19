import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET || 'dev-secret',
        // Parse JWT_EXPIRES as seconds (fallback: 1 day = 86400 seconds)
        signOptions: { expiresIn: process.env.JWT_EXPIRES ? parseInt(process.env.JWT_EXPIRES, 10) : 86400 },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
