import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async register(body: {
    email: string;
    username?: string;
    name?: string;
    surname?: string;
    gender?: 'man' | 'woman';
    password: string;
  }) {
    const errors: string[] = [];
    if (!body.email) errors.push('Email is required.');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Email format is invalid.');
    if (!body.username) errors.push('Username is required.');
    if (!body.name) errors.push('Name is required.');
    if (!body.surname) errors.push('Surname is required.');
    if (!body.password) errors.push('Password is required.');
    else if (body.password.length < 6) errors.push('Password must be at least 6 characters.');
    if (body.gender && !['man', 'woman'].includes(body.gender)) errors.push('Gender must be man or woman.');
    if (errors.length) throw new BadRequestException(errors);

    // uniqueness pre-check
    const existingEmail = await this.users.findByEmail(body.email);
    if (existingEmail) throw new BadRequestException('Email already exists.');
    if (body.username) {
      const existingUsername = await this.users.findByUsername(body.username);
      if (existingUsername) throw new BadRequestException('Username already exists.');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    let user;
    try {
      user = await this.users.createUser({ ...body, passwordHash });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Email or username already exists.');
      }
      throw e;
    }
    const accessToken = this.sign(user.id);
    return { user: this.public(user), accessToken };
  }

  async login(identifier: string, password: string) {
    if (!identifier || !password) throw new BadRequestException('Identifier and password are required.');
    const user = await this.users.findByEmailOrUsername(identifier);
    if (!user) throw new UnauthorizedException('Account not found for provided email or username.');
    const valid = await bcrypt.compare(password, (user as any).passwordHash);
    if (!valid) throw new UnauthorizedException('Incorrect password.');
    const accessToken = this.sign(user.id);
    return { user: this.public(user), accessToken };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters.');
    }
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found.');
    // need passwordHash, fetch full
    const full = await this.users.findByEmailOrUsername(user.email);
    const valid = await bcrypt.compare(currentPassword, (full as any).passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect.');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.users.updatePassword(userId, passwordHash);
    return { success: true };
  }

  private sign(sub: string) {
    return this.jwt.sign({ sub });
  }

  private public(u: any) {
    const { passwordHash, ...rest } = u;
    return rest;
  }
}
