import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './services/organization.service';

describe('OrganizationController', () => {
  let organizationController: OrganizationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [OrganizationService],
    }).compile();

    organizationController = app.get<OrganizationController>(OrganizationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(organizationController.getHello()).toBe('Hello World!');
    });
  });
});
