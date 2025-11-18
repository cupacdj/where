import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 4000;

  await app.listen(process.env.PORT || 4000, '0.0.0.0');
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
