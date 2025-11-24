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

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }
}
