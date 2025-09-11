import { Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from '../store/entities/store.entity';

@Controller('deletion')
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @UseGuards(CustomerGuard)
  @Delete('soft-customer')
  softDeleteCustomer(@CurrentUser() customer:Customer)
  {
    return this.deletionService.softDeleteCustomer(customer)
  }

  @UseGuards(AdminGuard)
  @Put('restore-customer/:customerId')
  restoreCustomer(@Param('customerId') customerId:number)
  {
    return this.deletionService.restoreCustomer(customerId)
  }

  @UseGuards(AdminGuard)
  @Delete('hard-customer/:customerId')
  hardDeleteCustomer(@Param('customerId') customerId:number)
  {
    return this.deletionService.hardDeleteCustomer(customerId)
  }

  @UseGuards(StoreOrOwnerGuard)
  @Delete('soft-store')
  softDeleteStore(@CurrentUser() store:Store)
  {
    return this.deletionService.softDeleteStore(store)
  }
}
