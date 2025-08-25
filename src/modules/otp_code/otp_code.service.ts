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

@Injectable()
export class OtpCodeService {
  constructor(
    @Inject(repositories.otpCode_repository)
    private otpCodeRepo: typeof OtpCode,
    private readonly smsService: SmsService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService
  ) {}

  async sendOtp(dto: SendOtpDto, type: 'customer' | 'owner', lang: Language = Language.en) {
    const {phone} = dto
    if (type === 'owner') {
        const existingOtp = await this.otpCodeRepo.findOne({
            where: { phone, type: 'owner', isUsed: true },
        });

        if (existingOtp) {
            const msg = this.i18n.translate('translation.otp.already_sent', { lang });
            throw new BadRequestException(msg);
        }

        const code = generateOtpCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.otpCodeRepo.create({ phone, code, isUsed: false, type: 'owner',expiresAt });

        const msg = this.i18n.translate('translation.otp.sent', { lang });
        return { message: msg, phone, code ,status:'signup'};
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

  async verifyOtp(phone: string,type: 'customer' | 'owner', code: string, lang: Language = Language.en) {
    const record = await this.otpCodeRepo.findOne({
      where: { phone, code, isVerified: false,type },
      order: [['createdAt', 'DESC']],
    });

    if (!record || record.expiresAt < new Date()) {
      const msg = this.i18n.translate('translation.otp.invalid', { lang });
      throw new BadRequestException(msg);
    }
    const msg = this.i18n.translate('translation.otp.success', { lang });
    if (type === 'owner') {
      const token = generateRefreshToken({ phone });
      record.isVerified = true;
      record.token = token;
      await record.save();
      return { token, message: msg };
    }

    if(type==='customer')
    {
      record.isVerified = true;
      await record.save();
      const customer = await this.customerService.findByPhone(phone);
      if(customer)
      {
        const payload = { id: customer.id, role: RoleStatus.CUSTOMER };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        const login_data = await this.customerService.login(phone);
        customer.refreshToken = refreshToken;
        await customer.save();
        return { status: 'login', customer: login_data.customer,accessToken,refreshToken};
      }
      else{
        const customer = await this.customerService.createCustomer(phone)
        const payload = { id: customer.id, role: RoleStatus.CUSTOMER };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        customer.refreshToken = refreshToken;
        await customer.save();
        return { status: 'signup',customer, phone, accessToken, refreshToken};
      }
    }
  }

  async validateOtp(phone: string, token: string,type:'customer' | 'owner', lang: Language = Language.en) {
    const otp = await this.otpCodeRepo.findOne({
      where: { phone, token, isVerified: true, isUsed: false,type },
      order: [['createdAt', 'DESC']],
    });

    if (!otp) {
      const msg = this.i18n.translate('translation.otp.verification_failed', { lang });
      throw new BadRequestException(msg);
    }

    return otp;
  }
}