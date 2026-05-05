import { Test, TestingModule } from '@nestjs/testing';
import { DressService } from './dress.service';

describe('DressService', () => {
  let service: DressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DressService],
    }).compile();

    service = module.get<DressService>(DressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
