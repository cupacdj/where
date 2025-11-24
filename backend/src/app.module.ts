import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { PlacesModule } from './modules/places/places.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlaceImagesModule } from './modules/place-images/place-images.module';
import { PlaceExistsMiddleware } from './middleware/placeExists.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    PlacesModule,
    AuthModule,
    PlaceImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PlaceExistsMiddleware)
      .forRoutes('places/:placeId/images');
  }
}
