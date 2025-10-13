import { AdminService } from 'src/modules/admin/admin.service';
import { UserTokenService } from './../user_token/user_token.service';
import { OwnerService } from 'src/modules/owner/owner.service';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OtpCode } from './entities/otp_code.entity';
import { generateOtpCode } from 'src/common/utils/generateOtpCode';
import { SmsService } from '../sms/sms.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { SendOtpDto } from './dto/send_otp.dto';
import { CustomerService } from '../customer/customer.service';
import { generateTokens } from 'src/common/utils/generateToken';
import { RoleStatus } from 'src/common/enums/role_status';
import { DEMO_CUSTOMER_PHONE, DEMO_OTP_CODE, DEMO_OWNER_PHONE } from 'src/common/constants/demos';
import { VerifyOtpDto } from './dto/verify_opt.dto';
import { SMSMessages } from 'src/common/constants/notification/sms-messages';

@Injectable()
export class OtpCodeService {
  constructor(
    @Inject(repositories.otpCode_repository)
    private otpCodeRepo: typeof OtpCode,
    private readonly smsService: SmsService,
    private readonly userTokenService:UserTokenService,
    private readonly i18n: I18nService,
    private readonly ownerService:OwnerService,
    private readonly adminService:AdminService,
    @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService
  ) {}

  async sendOtp(dto: SendOtpDto, type: RoleStatus,lang:Language) {
    const {phone} = dto
    if (
      (type === RoleStatus.OWNER && phone === DEMO_OWNER_PHONE) ||
      (type === RoleStatus.CUSTOMER && phone === DEMO_CUSTOMER_PHONE)
    ) {
      return { phone, code: DEMO_OTP_CODE, status: 'login' };
    }
    const code = generateOtpCode();
    // const message = SMSMessages.SEND_CODE(code)[lang] || SMSMessages.SEND_CODE(code).ar;
    // await this.smsService.sendSms(phone,message);
    const serviceMap = {
      owner: { service: this.ownerService, role: RoleStatus.OWNER },
      customer: { service: this.customerService, role: RoleStatus.CUSTOMER },
      admin: { service: this.adminService, role: RoleStatus.ADMIN }
    };
    const { service, role } = serviceMap[type] || {};
    if (!service) throw new BadRequestException('Invalid type');
    const entity = await service.findByPhone(phone);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    if (type === RoleStatus.ADMIN) {
      if (!entity) {
        throw new BadRequestException('Admin with this phone not found');
      }
      await this.otpCodeRepo.create({ phone, code, type, isVerified: false, expiresAt});
      return { phone, code, status: 'login' };
    }
    await this.otpCodeRepo.create({phone,code,type: role,isVerified: false,expiresAt});
    return {phone,code,status: entity ? 'login' : 'signup',};
  }

  async verifyOtp(body: VerifyOtpDto,type: RoleStatus,lang: Language,device?: string,ip?: string,) 
  {
    const { phone, code, deviceId } = body;
    const serviceMap = {
      [RoleStatus.OWNER]: { service: this.ownerService, entityName: 'owner', createFn: this.ownerService.createOwner.bind(this.ownerService) },
      [RoleStatus.CUSTOMER]: { service: this.customerService, entityName: 'customer', createFn: this.customerService.createCustomer.bind(this.customerService) },
      [RoleStatus.ADMIN]: { service: this.adminService, entityName: 'admin' }
    };
    const mapEntry = serviceMap[type];
    if (!mapEntry) throw new BadRequestException('Invalid type');
    const { service, entityName, createFn } = mapEntry;
    const isDemoOtp =
    ((type === RoleStatus.OWNER && phone === DEMO_OWNER_PHONE) ||
    (type === RoleStatus.CUSTOMER && phone === DEMO_CUSTOMER_PHONE)) &&
    code === DEMO_OTP_CODE;
    if (isDemoOtp) {
      let entity = await service.findByPhone(phone) || await createFn(phone);
      const tokens = generateTokens(entity.id, type);
      await this.userTokenService.handleUserToken(type, entity.id, tokens.refreshToken, deviceId, device, ip);

      return { status: 'login', [entityName]: entity, ...tokens };
    }
    const record = await this.otpCodeRepo.findOne({
      where: { phone, code, isVerified: false, type },
      order: [['createdAt', 'DESC']],
    });

    if (!record || record.expiresAt < new Date()) {
      const msg = this.i18n.translate('translation.otp.invalid', { lang });
      throw new BadRequestException(msg);
    }

    record.isVerified = true;
    await record.save();

    let entity = await service.findByPhone(phone);
    let status: 'login' | 'signup' = 'login';
    if (type === RoleStatus.ADMIN && !entity) {
      throw new BadRequestException('Admin with this phone not found');
    }
    if (!entity && createFn) {
      entity = await createFn(phone);
      status = 'signup';
    }

    const tokens = generateTokens(entity.id, type);
    await this.userTokenService.handleUserToken(type, entity.id, tokens.refreshToken, deviceId, device, ip);

    return { status, [entityName]: entity, ...tokens };
  }
}