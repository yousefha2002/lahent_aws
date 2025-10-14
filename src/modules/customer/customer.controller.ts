import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { CustomerDetailsDto } from './dto/customer.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get current logged in customer' })
  @ApiResponse({ status: 200, description: 'Returns the currently logged in customer', type: CustomerDetailsDto })
  @Serilaize(CustomerDetailsDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Get()
  getMine(@CurrentUser() user: CurrentUserType) {
    const {context} = user
    return context;
  }

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Update current customer profile' })
  @ApiBody({type:UpdateCustomerDto})
  @ApiResponse({ status: 200, description: 'Customer profile updated successfully', type: CustomerDetailsDto })
  @Serilaize(CustomerDetailsDto)
  @ApiQuery({ name: 'customerId', required: false, example: 1 })
  @PermissionGuard([RoleStatus.CUSTOMER,RoleStatus.ADMIN],PermissionKey.UpdateCustomer)
  @Put()
  updateCustomer(
    @CurrentUser() user: CurrentUserType,
    @Body() body: UpdateCustomerDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.customerService.updateProfile(context, body, lang);
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