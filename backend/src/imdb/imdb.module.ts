import { Module } from '@nestjs/common';
import { ImdbService } from './imdb.service';
import { ImdbController } from './imdb.controller';

@Module({
  controllers: [ImdbController],
  providers: [ImdbService],
  exports: [ImdbService],
})
export class ImdbModule {}
