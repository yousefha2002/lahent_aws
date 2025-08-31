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

@Injectable()
export class OtpCodeService {
  constructor(
    @Inject(repositories.otpCode_repository)
    private otpCodeRepo: typeof OtpCode,
    private readonly smsService: SmsService,
    private readonly i18n: I18nService,
    private readonly ownerService:OwnerService,
    @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService
  ) {}

  async sendOtp(dto: SendOtpDto, type: 'customer' | 'owner') {
    const {phone} = dto
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

  async verifyOtp(phone: string,type: 'customer' | 'owner', code: string, lang: Language = Language.en) {
    const record = await this.otpCodeRepo.findOne({
      where: { phone, code, isVerified: false,type },
      order: [['createdAt', 'DESC']],
    });

    if (!record || record.expiresAt < new Date()) {
      const msg = this.i18n.translate('translation.otp.invalid', { lang });
      throw new BadRequestException(msg);
    }
    if (type === 'owner') {
      record.isVerified = true;
      await record.save();
      const owner = await this.ownerService.findByPhone(phone);
      if(owner)
      {
        const payload = { id: owner.id, role: RoleStatus.OWNER };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        const login_data = await this.ownerService.login(phone);
        owner.refreshToken = refreshToken
        await owner.save()
        return { status: 'login', owner: login_data.owner,accessToken,refreshToken};
      }
      else{
        const owner = await this.ownerService.createOwner(phone)
        const payload = { id: owner.id, role: RoleStatus.OWNER };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        owner.refreshToken = refreshToken;
        await owner.save();
        return { status: 'signup',owner, phone, accessToken, refreshToken};
      }
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
}