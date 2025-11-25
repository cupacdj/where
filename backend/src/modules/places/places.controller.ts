import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlaceType } from '@prisma/client';

@Controller('places')
export class PlacesController {
  constructor(private service: PlacesService) {}

  @Get()
  list(@Query('type') type?: PlaceType) {
    return this.service.list(type);
  }

  @Get('tags')
  listTags() {
    return this.service.listTags();
  }

  @Get('search')
  search(
    @Query('q') q?: string,
    @Query('type') type?: PlaceType,
    @Query('tags') tagsRaw?: string | string[],
  ) {
    const tags =
      typeof tagsRaw === 'string'
        ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
        : Array.isArray(tagsRaw)
        ? tagsRaw
        : [];
    return this.service.search({ q, type, tags });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
