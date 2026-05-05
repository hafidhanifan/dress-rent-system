import { Module } from '@nestjs/common';
import { DressService } from './dress.service';
import { DressController } from './dress.controller';

@Module({
  providers: [DressService],
  controllers: [DressController]
})
export class DressModule {}
