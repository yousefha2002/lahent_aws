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
import { generateAccessToken, generateRefreshToken } from 'src/common/utils/generateToken';
import { RoleStatus } from 'src/common/enums/role_status';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';
import { DEMO_CUSTOMER_PHONE, DEMO_OTP_CODE, DEMO_OWNER_PHONE } from 'src/common/constants/demos';

@Injectable()
export class OtpCodeService {
  constructor(
    @Inject(repositories.otpCode_repository)
    private otpCodeRepo: typeof OtpCode,
    private readonly smsService: SmsService,
    private readonly userTokenService:UserTokenService,
    private readonly i18n: I18nService,
    private readonly ownerService:OwnerService,
    @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService
  ) {}

  async sendOtp(dto: SendOtpDto, type: 'customer' | 'owner') {
    const {phone} = dto
    if (
      (type === 'owner' && phone === DEMO_OWNER_PHONE) ||
      (type === 'customer' && phone === DEMO_CUSTOMER_PHONE)
    ) {
      return { phone, code: DEMO_OTP_CODE, status: 'login' };
    }
    if (type === 'owner') {
        const owner = await this.ownerService.findByPhone(dto.phone)
        const code = generateOtpCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.otpCodeRepo.create({ phone, code,isVerified: false, type: 'owner',expiresAt });
        if (owner) {
            return {phone, code, status: 'login' };
        } 
        else{
            return {phone, code,status:"signup" };
        }
    }

      if (type === 'customer') {
        const customer = await this.customerService.findByPhone(phone)
        const code = generateOtpCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.otpCodeRepo.create({phone,code,type: 'customer',isVerified: false,expiresAt});
        if (customer) {
            return {phone, code, status: 'login' };
        } 
        else{
            return {phone, code,status:"signup" };
        }
    }

    throw new BadRequestException('Invalid type');
  }

  async verifyOtp(
    phone: string,
    type: 'customer' | 'owner',
    code: string,
    lang: Language,
      device?: string,
      ip?: string,
    ) {
      if (
        ((type === 'owner' && phone === DEMO_OWNER_PHONE) ||
          (type === 'customer' && phone === DEMO_CUSTOMER_PHONE)) &&
        code === DEMO_OTP_CODE
      ) {
        if (type === 'owner') {
          let owner = await this.ownerService.findByPhone(phone);
          if (!owner) {
            owner = await this.ownerService.createOwner(phone);
          }
          const payload = { id: owner.id, role: RoleStatus.OWNER };
          const accessToken = generateAccessToken(payload);
          const refreshToken = generateRefreshToken(payload);
          return { status: 'login', owner, accessToken, refreshToken };
        }

        if (type === 'customer') {
          let customer = await this.customerService.findByPhone(phone);
          if (!customer) {
            customer = await this.customerService.createCustomer(phone);
          }
          const payload = { id: customer.id, role: RoleStatus.CUSTOMER };
          const accessToken = generateAccessToken(payload);
          const refreshToken = generateRefreshToken(payload);
          return { status: 'login', customer, accessToken, refreshToken };
        }
      }

      // 🔽 باقي الكود الأصلي
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

      if (type === 'owner') {
        let owner = await this.ownerService.findByPhone(phone);
        let status: 'login' | 'signup' = 'login';
        if (!owner) {
          owner = await this.ownerService.createOwner(phone);
          status = 'signup';
        }
        const payload = { id: owner.id, role: RoleStatus.OWNER };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await this.userTokenService.createToken({
          ownerId: owner.id,
          role: RoleStatus.OWNER,
          refreshToken,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
          device,
          ip,
        });

        return { status, owner, accessToken, refreshToken };
      }

      if (type === 'customer') {
        let customer = await this.customerService.findByPhone(phone);
        let status: 'login' | 'signup' = 'login';
        if (!customer) {
          customer = await this.customerService.createCustomer(phone);
          status = 'signup';
        }
        const payload = { id: customer.id, role: RoleStatus.CUSTOMER };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await this.userTokenService.createToken({
          customerId: customer.id,
          role: RoleStatus.CUSTOMER,
          refreshToken,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
          device,
          ip,
        });

        return { status, customer, phone, accessToken, refreshToken };
  }}
}