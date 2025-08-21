import { Body, Controller, Get, Post, Put, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Language } from 'src/common/enums/language';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from './entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CustomerDto, CustomerDtoWithMessageToken } from './dto/customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Serilaize(CustomerDto)
  @UseGuards(CustomerGuard)
  @Get()
  getMine(@CurrentUser() user:Customer)
  {
    return user
  }

  @Serilaize(CustomerDto)
  @UseGuards(CustomerGuard)
  @Put()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  updateCustomer(@CurrentUser() user:Customer,@Body() body:UpdateCustomerDto,@Query('lang') lang=Language.en,@UploadedFile() file?: Express.Multer.File)
  {
    return this.customerService.updateProfile(user.id,body,lang,file)
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.customerService.refreshToken(refreshToken)
  }
}