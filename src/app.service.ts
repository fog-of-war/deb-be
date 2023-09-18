import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {

  constructor(@Inject('GREETING_SERVICE') private client: ClientProxy){}

  async getHello(){
    return this.client.send({cmd: 'greeting'}, 'Progressive Coder');
  }

  async getHelloAsync() {
    try {
      const message = await this.client.send({ cmd: 'greeting-async' }, 'Progressive Coder');
      return message;
    } catch (error) {
      // 예외 처리 로직을 여기에 추가합니다.
      console.error('An error occurred in getHelloAsync:', error);
      throw error; // 예외를 다시 throw하여 상위 호출자에게 전파합니다.
    }
  }
}