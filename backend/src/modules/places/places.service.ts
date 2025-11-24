import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlaceType } from '@prisma/client';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async list(type?: PlaceType) {
    const base = process.env.PUBLIC_BASE_URL || '';
    return this.prisma.place.findMany({
      where: type ? { type } : {},
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    }).then(items =>
      items.map(p => {
        const rel = p.images[0]?.url || null;
        const abs = rel && rel.startsWith('/') ? `${base}${rel}` : rel;
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          city: p.city,
          primaryImage: abs,
        };
      }),
    );
  }

  async get(id: string) {
    const base = process.env.PUBLIC_BASE_URL || '';
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        tags: {
          include: { tag: { select: { name: true, displayName: true, category: true } } },
        },
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        stats: true,
      },
    });
    if (!place) return null;
    place.images = place.images.map(img => ({
      ...img,
      url: img.url.startsWith('/') ? `${base}${img.url}` : img.url,
    }));
    return place;
  }
}
