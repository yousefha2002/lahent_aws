import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductInstructionService } from './product_instruction.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { UpdateProductInstructionDto } from './dto/update-product-instruction.sto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateProductInstructionDto } from './dto/create-product-instruction.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('product-instruction')
export class ProductInstructionController {
  constructor(
    private readonly productInstructionService: ProductInstructionService,
  ) {}

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put(':instructionId')
  @ApiOperation({ summary: 'Update a product instruction' })
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'instructionId',
    type: Number,
    description: 'ID of the product instruction',
    example: 7,
  })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiBody({ type: UpdateProductInstructionDto })
  @ApiResponse({
    status: 200,
    description: 'Product instruction updated successfully',
    schema: { example: { message: 'Product instruction updated successfully' } },
  })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  update(
    @Body() body: UpdateProductInstructionDto,
    @Param('instructionId') instructionId: string,
    @CurrentUser() store: Store,
  ) {
    return this.productInstructionService.updateProductInstruction(+instructionId,body,store.id);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:instructionId')
  @ApiOperation({ summary: 'Toggle active status for a product instruction' })
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'instructionId',
    type: Number,
    description: 'ID of the product instruction',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Active status updated successfully',
    schema: {
      example: { message: 'active status updated' },
    },
  })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
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
  @ApiOperation({ summary: 'Create product instructions' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateProductInstructionDto })
  @ApiResponse({
    status: 201,
    description: 'Product instructions created successfully',
    schema: {
      example: { message: 'Product instructions created successfully' },
    },
  })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  create(@Body() body: CreateProductInstructionDto,@CurrentUser() store:Store) {
    return this.productInstructionService.createProductInstructions(body,store.id);
  }
}
