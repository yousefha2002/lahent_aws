import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FcmTokenService } from './fcm_token.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { AnyUserGuard } from 'src/common/guards/any-user-guard';
import { RegisterFcmTokenDto } from './dtos/register_fcm_token.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('fcm_token')
export class FcmTokenController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}

  @ApiOperation({ summary: 'Register FCM token for the current user' })
  @ApiResponse({ status: 201, description: 'FCM token registered successfully.' })
  @ApiSecurity('access-token')
  @ApiBody({type:[RegisterFcmTokenDto]})
  @UseGuards(AnyUserGuard)
  @Post('register')
  async registerToken(
    @CurrentUser() user:any,
    @Req() req: Request,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    const device = req.headers['user-agent'] || 'unknown';
    const { id: userId, role } = user;
    return this.fcmTokenService.registerToken(userId, role, dto, device);
  }
}