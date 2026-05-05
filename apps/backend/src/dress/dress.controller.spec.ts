import { Test, TestingModule } from '@nestjs/testing';
import { DressController } from './dress.controller';

describe('DressController', () => {
  let controller: DressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DressController],
    }).compile();

    controller = module.get<DressController>(DressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
