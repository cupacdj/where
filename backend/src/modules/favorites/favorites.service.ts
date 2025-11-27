import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(userId: string, placeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_placeId: { userId, placeId } },
      });
      return { favorited: false };
    }

    // ensure place exists and is active
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Place not found');

    await this.prisma.favorite.create({
      data: { userId, placeId },
    });
    return { favorited: true };
  }

  async listFavorites(userId: string) {
    const base = process.env.PUBLIC_BASE_URL || '';
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        place: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
              orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
            },
            stats: true,
            tags: {
              include: { tag: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((f) => {
      const p = f.place;
      const rel = p.images[0]?.url || null;
      const abs = rel && rel.startsWith('/') ? `${base}${rel}` : rel;
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        city: p.city,
        address: p.address,
        primaryImage: abs,
        stats: p.stats,
        tags: p.tags,
        favoritedAt: f.createdAt,
      };
    });
  }

  async isFavorite(userId: string, placeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });
    return { favorited: !!existing };
  }
}
