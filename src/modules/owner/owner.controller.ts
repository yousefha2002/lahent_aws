import { Body, Controller, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
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

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Serilaize(OnwerWithTokenDto)
  @Post('create')
  async createOwner(@Body() body: CreateOwnerDto,@Query('lang') lang=Language.en) {
    return this.ownerService.createOwner(body,lang);
  }

  @Serilaize(OnwerWithTokenDto)
  @Post('login')
  async loginOwner(@Body() body: LoginOwnerDto,@Query('lang') lang=Language.en) {
    return this.ownerService.login(body,lang);
  }

  @Serilaize(OnwerWithMessageDto)
  @UseGuards(OwnerGuard)
  @Put()
  async updateOwner(@Body() body: UpdateOwnerDto,@CurrentUser() user:Owner,@Query('lang') lang=Language.en
  ) 
  {
    return this.ownerService.updateOwner(body,user,lang);
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.ownerService.refreshToken(refreshToken)
  }
}
