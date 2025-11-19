import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Gender } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Return public users list
  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, username: true, name: true, surname: true, gender: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByEmailOrUsername(identifier: string) {
    const identLower = identifier.toLowerCase();
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identLower }, { username: identifier }],
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, name: true, surname: true, gender: true },
    });
  }

  async createUser(data: {
    email: string;
    username?: string;
    name?: string;
    surname?: string;
    gender?: 'man' | 'woman';
    passwordHash: string;
  }) {
    const fullName = [data.name, data.surname].filter(Boolean).join(' ') || null;
    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username,
        name: data.name,
        surname: data.surname,
        gender: data.gender
          ? data.gender === 'man'
            ? Gender.MAN
            : Gender.WOMAN
          : undefined,
        fullName,
        passwordHash: data.passwordHash,
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: { id: true },
    });
  }
}
