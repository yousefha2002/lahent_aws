import { Body,Controller,Delete,Get,Param,Post,Put,UseGuards} from '@nestjs/common';
import { AddressService } from './address.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AddressDto } from './dto/address.dto';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity} from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util'; 
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';

import { RoleStatus } from 'src/common/enums/role_status';
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Serilaize(AddressDto)
  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  @ApiOperation({ summary: 'Create a new address for the current customer' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    type: AddressDto,
  })
  @Post()
  create(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateAddressDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.addressService.create(context.id, dto, lang);
  }

  @Serilaize(AddressDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @UseGuards(CompletedProfileGuard)
  @ApiOperation({ summary: 'Update an existing address' })
  @ApiSecurity('access-token')
  @ApiParam({name: 'id',description: 'ID of the address to update',example: 1})
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({status: 200,type: AddressDto})
  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserType,
    @Param('id') addressId: number,
    @Body() dto: UpdateAddressDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.addressService.update(context.id, addressId, dto, lang);
  }

  @Serilaize(AddressDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @ApiOperation({ summary: 'Get all addresses for the current customer' })
  @ApiSecurity('access-token')
  @ApiResponse({status: 200,type: [AddressDto]})
  @Get()
  getAll(
    @CurrentUser() user: CurrentUserType,
  ) {
    const {context} = user
    return this.addressService.getAll(context.id);
  }

  @PermissionGuard([RoleStatus.CUSTOMER])
  @ApiOperation({ summary: 'Delete an address by ID' })
  @ApiSecurity('access-token')
  @ApiParam({
    name: 'id',
    description: 'ID of the address to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
    schema: { example: { message: 'Deleted successfully' } },
  })
  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserType,
    @Param('id') addressId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.addressService.remove(context.id, addressId, lang);
  }
}
