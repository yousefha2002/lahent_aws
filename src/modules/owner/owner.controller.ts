import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Owner } from './entities/owner.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { OwnerDto } from './dto/owner.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @ApiOperation({ summary: 'Update current owner profile' })
  @ApiSecurity('access-token')
  @ApiBody({ type: UpdateOwnerDto })
  @ApiResponse({
    status: 200,
    description: 'Owner profile updated successfully with message',
    type: OwnerDto,
  })
  @Serilaize(OwnerDto)
  @UseGuards(OwnerGuard)
  @Put()
  async updateOwner(
    @Body() body: UpdateOwnerDto,
    @CurrentUser() user: Owner,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.ownerService.updateOwnerProfile(user.id, body, lang);
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
    return this.ownerService.refreshToken(refreshToken);
  }

  @ApiOperation({ summary: 'Get current owner profile' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'Current owner profile returned successfully',
    type: OwnerDto,
  })
  @Serilaize(OwnerDto)
  @UseGuards(OwnerGuard)
  @Get('current')
  getCurrentOwner(@CurrentUser() owner:Owner)
  {
    return owner
  }
}