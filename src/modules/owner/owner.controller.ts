import { Body, Controller, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Owner } from './entities/owner.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { OwnerDto } from './dto/owner.dto';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

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
  async updateOwner(@Body() body: UpdateOwnerDto,@CurrentUser() user:Owner,@Req() req
  ) 
  {
    return this.ownerService.updateOwnerProfile(user.id,body,req.lang);
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
