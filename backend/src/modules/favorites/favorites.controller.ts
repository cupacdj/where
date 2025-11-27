import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('favorites')
export class FavoritesController {
  constructor(private service: FavoritesService) {}

  @Get()
  list(@Req() req: any) {
    const userId = req.user.userId;
    return this.service.listFavorites(userId);
  }

  @Post(':placeId/toggle')
  toggle(@Req() req: any, @Param('placeId') placeId: string) {
    const userId = req.user.userId;
    return this.service.toggleFavorite(userId, placeId);
  }

  @Get(':placeId')
  isFavorite(@Req() req: any, @Param('placeId') placeId: string) {
    const userId = req.user.userId;
    return this.service.isFavorite(userId, placeId);
  }
}
