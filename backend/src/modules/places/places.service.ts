import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.place.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        stats: true,
        images: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
