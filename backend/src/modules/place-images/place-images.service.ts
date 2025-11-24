import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import axios from 'axios';

@Injectable()
export class PlaceImagesService {
  constructor(private prisma: PrismaService) {}

  private ensurePlacesDir() {
    const dir = join(process.cwd(), 'uploads', 'places');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  async addUploaded(placeId: string, file: Express.Multer.File, isPrimary?: boolean) {
    if (!file) throw new BadRequestException('File missing');
    this.ensurePlacesDir();
    const image = await this.prisma.placeImage.create({
      data: {
        placeId,
        url: `/uploads/places/${file.filename}`,
        isPrimary: !!isPrimary,
        source: 'MANUAL',
      },
    });
    if (isPrimary) {
      await this.prisma.placeImage.updateMany({
        where: { placeId, NOT: { id: image.id } },
        data: { isPrimary: false },
      });
    }
    return image;
  }

  async importFromUrl(placeId: string, sourceUrl: string, isPrimary?: boolean) {
    if (!sourceUrl) throw new BadRequestException('sourceUrl required');
    this.ensurePlacesDir();
    const resp = await axios.get(sourceUrl, { responseType: 'stream' });
    const extGuess = (resp.headers['content-type'] || '').includes('png') ? 'png' : 'jpg';
    const filename = `${randomUUID()}.${extGuess}`;
    const fullPath = join(process.cwd(), 'uploads', 'places', filename);
    await new Promise<void>((res, rej) => {
      const stream = createWriteStream(fullPath);
      resp.data.pipe(stream);
      stream.on('finish', () => res());
      stream.on('error', rej);
    });
    return this.addUploaded(placeId, { filename } as Express.Multer.File, isPrimary);
  }

  async list(placeId: string) {
    return this.prisma.placeImage.findMany({
      where: { placeId },
      orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async remove(placeId: string, imageId: string) {
    return this.prisma.placeImage.delete({
      where: { id: imageId },
    });
  }

  async setPrimary(placeId: string, imageId: string) {
    await this.prisma.placeImage.updateMany({
      where: { placeId },
      data: { isPrimary: false },
    });
    return this.prisma.placeImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }
}
