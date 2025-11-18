import { Controller, Get } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private placesService: PlacesService) {}

  @Get()
  findAll() {
    return this.placesService.findAll();
  }
}
