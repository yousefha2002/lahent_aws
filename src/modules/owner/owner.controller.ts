import { Body, Controller, Post, Put, Query, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { LoginOwnerDto } from './dto/owner-login.dto';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Owner } from './entities/owner.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { OnwerWithMessageDto, OnwerWithTokenDto } from './dto/owner.dto';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @ApiOperation({ summary: 'Create new owner account' })
  @ApiBody({ type: CreateOwnerDto })
  @ApiResponse({status: 201,description: 'Owner created successfully with tokens',type: OnwerWithTokenDto,})
  @Serilaize(OnwerWithTokenDto)
  @Post('create')
  async createOwner(@Body() body: CreateOwnerDto,@Query('lang') lang=Language.en) {
    return this.ownerService.createOwner(body,lang);
  }

  @ApiOperation({ summary: 'Owner login using phone and password' })
  @ApiBody({ type: LoginOwnerDto })
  @ApiResponse({
    status: 200,
    description: 'Owner logged in successfully with access and refresh tokens',
    type: OnwerWithTokenDto,
  })
  @Serilaize(OnwerWithTokenDto)
  @Post('login')
  async loginOwner(@Body() body: LoginOwnerDto,@Query('lang') lang=Language.en) {
    return this.ownerService.login(body,lang);
  }

  @ApiOperation({ summary: 'Update current owner profile' })
  @ApiSecurity('access-token')
  @ApiBody({ type: UpdateOwnerDto })
  @ApiResponse({
    status: 200,
    description: 'Owner profile updated successfully with message',
    type: OnwerWithMessageDto,
  })
  @Serilaize(OnwerWithMessageDto)
  @UseGuards(OwnerGuard)
  @Put()
  async updateOwner(@Body() body: UpdateOwnerDto,@CurrentUser() user:Owner,@Query('lang') lang=Language.en
  ) 
  {
    return this.ownerService.updateOwner(body,user,lang);
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
    return this.ownerService.refreshToken(refreshToken)
  }
}
