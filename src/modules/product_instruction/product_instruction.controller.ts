import {Body,Controller,Param,Post,Put,UseGuards} from '@nestjs/common';
import { ProductInstructionService } from './product_instruction.service';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { UpdateProductInstructionDto } from './dto/update-product-instruction.sto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateProductInstructionDto } from './dto/create-product-instruction.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { StoreOrAdminGuard } from 'src/common/guards/roles/store-or-admin-guard';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('product-instruction')
export class ProductInstructionController {
  constructor(
    private readonly productInstructionService: ProductInstructionService,
  ) {}

  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  @Put(':instructionId')
  @ApiOperation({ summary: 'Update a product instruction' })
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'instructionId',
    type: Number,
    description: 'ID of the product instruction',
    example: 7,
  })
  @ApiBody({ type: UpdateProductInstructionDto })
  @ApiResponse({
    status: 200,
    description: 'Product instruction updated successfully',
    schema: { example: { message: 'Product instruction updated successfully' } },
  })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  update(
    @Body() body: UpdateProductInstructionDto,
    @Param('instructionId') instructionId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const {context} = user
    return this.productInstructionService.updateProductInstruction(+instructionId,body,context.id);
  }

  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  @Put('/active/:instructionId')
  @ApiOperation({ summary: 'Toggle active status for a product instruction' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
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
  active(
    @Param('instructionId') instructionId: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const {context} = user
    return this.productInstructionService.updateIsActive(+instructionId,context.id);
  }

  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  @Post()
  @ApiOperation({ summary: 'Create product instructions' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateProductInstructionDto })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Product instructions created successfully',
    schema: {
      example: { message: 'Product instructions created successfully' },
    },
  })
  create(@Body() body: CreateProductInstructionDto,@CurrentUser() user:CurrentUserType) {
    const {context} = user
    return this.productInstructionService.createProductInstructions(body,context.id);
  }
}
