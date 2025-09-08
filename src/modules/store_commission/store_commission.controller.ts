import { Controller } from '@nestjs/common';
import { StoreCommissionService } from './store_commission.service';

@Controller('store-commission')
export class StoreCommissionController {
  constructor(private readonly storeCommissionService: StoreCommissionService) {}
}
