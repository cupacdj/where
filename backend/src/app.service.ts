import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'NightOut API',
      version: '0.0.1',
      message: 'Welcome to NightOut backend',
    };
  }
}
