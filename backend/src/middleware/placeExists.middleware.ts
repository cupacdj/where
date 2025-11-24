import { Injectable, NotFoundException, NestMiddleware } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaceExistsMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}
  async use(req: any, _res: any, next: () => void) {
    const placeId = req.params.placeId;
    if (!placeId) return next();
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) throw new NotFoundException('Place not found');
    req.place = place;
    next();
  }
}
