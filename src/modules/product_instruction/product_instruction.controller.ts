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
  ) {
    return this.productInstructionService.updateInstructionProduct(
      +instructionId,
      body,
    );
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:instructionId')
  active(@Param('instructionId') instructionId: string) {
    return this.productInstructionService.updateIsActive(+instructionId, true);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/unactive/:instructionId')
  unactive(@Param('instructionId') instructionId: string) {
    return this.productInstructionService.updateIsActive(+instructionId, false);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Delete('/:instructionId')
  delete(@Param('instructionId') instructionId: string) {
    return this.productInstructionService.deleteInstructionProduct(
      +instructionId,
    );
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(InstructionDto)
  @Post('/:instructionId')
  create(@Body() body: UpdateProductInstructionDto) {
    return this.productInstructionService.createSingleInstruction(body);
  }
}
