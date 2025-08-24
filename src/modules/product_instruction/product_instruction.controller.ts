import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductInstructionService } from './product_instruction.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { UpdateProductInstructionDto } from './dto/update-product-instruction.sto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { InstructionDto } from './dto/instruction-dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateProductInstructionDto } from './dto/create-product-instruction.dto';

@Controller('product-instruction')
export class ProductInstructionController {
  constructor(
    private readonly productInstructionService: ProductInstructionService,
  ) {}

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put(':instructionId')
  update(
    @Body() body: UpdateProductInstructionDto,
    @Param('instructionId') instructionId: string,
    @CurrentUser() store: Store,
  ) {
    return this.productInstructionService.updateProductInstruction(+instructionId,body,store.id);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:instructionId')
  active(
    @Param('instructionId') instructionId: string,
    @CurrentUser() store: Store,
  ) {
    return this.productInstructionService.updateIsActive(
      +instructionId,
      store.id,
    );
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Post()
  create(@Body() body: CreateProductInstructionDto,@CurrentUser() store:Store) {
    return this.productInstructionService.createProductInstructions(body,store.id);
  }
}
