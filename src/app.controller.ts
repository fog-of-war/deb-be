import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/greeting")
  async getHello() {
    return this.appService.getHello();
  }

  @Get("/greeting-async")
  async getHelloAsync() {
    console.log("/greeting-async")
    return this.appService.getHelloAsync();
  }
}