import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PlaceImagesService } from './place-images.service';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { Request } from 'express';

function filenameEdit(_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
  const ext = extname(file.originalname).toLowerCase() || '.jpg';
  cb(null, `${randomUUID()}${ext}`);
}

@Controller('places/:placeId/images')
export class PlaceImagesController {
  constructor(private service: PlaceImagesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'places'), // changed
        filename: filenameEdit,
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(
    @Param('placeId') placeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPrimary') isPrimary?: string,
  ) {
    return this.service.addUploaded(placeId, file, isPrimary === 'true');
  }

  @Post('import')
  import(
    @Param('placeId') placeId: string,
    @Body() body: { sourceUrl: string; isPrimary?: boolean },
  ) {
    return this.service.importFromUrl(placeId, body.sourceUrl, body.isPrimary);
  }

  @Get()
  list(@Param('placeId') placeId: string) {
    return this.service.list(placeId);
  }

  @Delete(':imageId')
  remove(@Param('placeId') placeId: string, @Param('imageId') imageId: string) {
    return this.service.remove(placeId, imageId);
  }

  @Patch(':imageId/primary')
  makePrimary(@Param('placeId') placeId: string, @Param('imageId') imageId: string) {
    return this.service.setPrimary(placeId, imageId);
  }
}
