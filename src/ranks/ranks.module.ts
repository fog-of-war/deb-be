import { Module } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { RanksController } from './ranks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({  
  imports: [PrismaModule],
  controllers: [RanksController],
  providers: [RanksService],
  exports:[RanksService]
})
export class RanksModule {}
