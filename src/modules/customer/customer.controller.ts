import { Body, Controller, Get, Post, Put, Query, Req, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { Language } from 'src/common/enums/language';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from './entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CustomerDto } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get current logged in customer' })
  @ApiResponse({status: 200,description: 'Returns the currently logged in customer',type: CustomerDto,})
  @Serilaize(CustomerDto)
  @UseGuards(CustomerGuard)
  @Get()
  getMine(@CurrentUser() user:Customer)
  {
    return user
  }

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Update current customer profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'johndoe@example.com' },
        avatarId: { type: 'string', example: '1', nullable: true },
        image: { type: 'string', format: 'binary' },
      },
      required: ['name', 'email']
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Customer profile updated successfully',
    type: CustomerDto,
  })
  @Serilaize(CustomerDto)
  @UseGuards(CustomerGuard)
  @Put()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  updateCustomer(@CurrentUser() user:Customer,@Body() body:UpdateCustomerDto,@Req() req,@UploadedFile() file?: Express.Multer.File)
  {
    return this.customerService.updateProfile(user.id,body,req.lang,file)
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'New access token returned successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.customerService.refreshToken(refreshToken)
  }
}