import { Body, Controller, Get, Post, Put, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { CustomerGuard } from 'src/common/guards/roles/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from './entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { CustomerDetailsDto } from './dto/customer.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get current logged in customer' })
  @ApiResponse({ status: 200, description: 'Returns the currently logged in customer', type: CustomerDetailsDto })
  @Serilaize(CustomerDetailsDto)
  @UseGuards(CustomerGuard)
  @Get()
  getMine(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return context;
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
      required: ['name', 'email'],
    },
  })
  @ApiResponse({ status: 200, description: 'Customer profile updated successfully', type: CustomerDetailsDto })
  @Serilaize(CustomerDetailsDto)
  @UseGuards(CustomerGuard)
  @Put()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  updateCustomer(
    @CurrentUser() user: CurrentUserType,
    @Body() body: UpdateCustomerDto,
    @I18n() i18n: I18nContext,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.customerService.updateProfile(context.id, body, lang, file);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({type:RefreshTokenDto})
  @ApiResponse({
    status: 200,
    description: 'New access token returned successfully',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',refreshToken:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } },
  })
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.customerService.refreshToken(dto);
  }
}