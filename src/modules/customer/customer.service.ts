import { AuditLogService } from './../audit_log/audit_log.service';
import { UserTokenService } from './../user_token/user_token.service';
import { AvatarService } from './../avatar/avatar.service';
import {BadRequestException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Customer } from './entities/customer.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { Avatar } from '../avatar/entities/avatar.entity';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {generateAccessToken, generateRefreshToken } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';
import { Op } from 'sequelize';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { prepareEntityChange } from 'src/common/utils/prepareEntityChange';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(repositories.customer_repository)
    private customerRepo: typeof Customer,
    private avatarService: AvatarService,
    private readonly i18n: I18nService,
    private jwtService: JwtService,
    private userTokenService:UserTokenService,
    private readonly auditLogService:AuditLogService
  ) {}
  async createCustomer(phone:string,lang=Language.ar)
  {
    const customer = await this.findByPhone(phone)
    if(customer)
    {
      const message =this.i18n.translate('translation.mobile_phone_exists', { lang });
      throw new BadRequestException(message);
    }
    const new_customer = await this.customerRepo.create({phone})
    await new_customer.save()
    return new_customer
  }

  async findById(id: number, lang = Language.ar) {
    const customer = await this.customerRepo.findOne({
      where: { id },
      include: [{ model: Avatar }],
    });
    if (!customer) {
      const message = this.i18n.translate('translation.customer_not_found', {
        lang,
      });
      throw new NotFoundException(message);
    }
    return customer;
  }

  async refreshToken(dto:RefreshTokenDto)
  {
    const {refreshToken,deviceId} = dto
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token'});
      const tokenRecord = await this.userTokenService.findTokenForRefreshing(refreshToken,deviceId)
      if (!tokenRecord) {
        throw new BadRequestException('Invalid or expired refresh token');
      }
      const customer = await this.findById(decoded.id);
      const accessToken = generateAccessToken({ id: customer.id, role: decoded.role });
      const newRefreshToken = generateRefreshToken({id: customer.id,role: decoded.role});
      await this.userTokenService.rotateToken(tokenRecord,newRefreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS));
      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new BadRequestException(err.message || 'Invalid or expired refresh token');
    }
  }

  async addToWallet(customerId: number, amount: number, transaction?: any) {
    const customer = await this.findById(customerId);
    customer.walletBalance += amount;
    await customer.save({ transaction });
  }

  async detuctPoints(customerId: number, amount: number, transaction?: any) {
    const customer = await this.findById(customerId);
    customer.points -= amount;
    await customer.save({ transaction });
  }

  async addPoints(customerId: number, amount: number, transaction?: any) {
    const customer = await this.findById(customerId);
    customer.points += amount;
    await customer.save({ transaction });
  }

  async detuctFromWallet(
    customerId: number,
    amount: number,
    transaction?: any,
  ) {
    const customer = await this.findById(customerId);
    customer.walletBalance -= amount;
    await customer.save({ transaction });
  }

  async updateProfile(customer: Customer,actor: ActorInfo,dto: UpdateCustomerDto,lang: Language) {
    const oldCustomer = { ...customer.get({ plain: true }) };

    const hasAvatarId = !!dto.avatarId;
    const hasName = !!dto.name;
    const hasEmail = !!dto.email;

    if (hasEmail && dto.email !== customer.email) {
      const existing = await this.customerRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        const message = this.i18n.translate('translation.email_exists', { lang });
        throw new BadRequestException(message);
      }
    }

    const isFirstTime = !customer.name && !customer.email && !customer.avatarId;

    if (isFirstTime && (!hasName || !hasEmail || !hasAvatarId)) {
      const message = this.i18n.translate('translation.must_send_all_first_time', {
        lang,
      });
      throw new BadRequestException(message);
    }

    if (hasAvatarId && dto.avatarId) {
      const avatar = await this.avatarService.findById(+dto.avatarId);
      customer.avatarId = +avatar.id;
    }

    if (hasName) customer.name = dto.name;
    if (hasEmail) customer.email = dto.email;

    customer.isCompletedProfile = true;

    await customer.save();
    const customerAfterUpdate = await customer.reload({ include: ['avatar'] });

    const { oldEntity, newEntity } = prepareEntityChange({
      oldEntity: oldCustomer,
      newEntity: customerAfterUpdate.get({ plain: true }),
    });

    await this.auditLogService.logChange({
      actor,
      entity: AuditLogEntity.CUSTOMER,
      action: AuditLogAction.UPDATE,
      oldEntity,
      newEntity,
      fieldsToExclude: ['avatar', 'createdAt', 'updatedAt'],
    });

    return customer;
  }

  async findByPhone(phone: string) {
    const customer = await this.customerRepo.findOne({ where: { phone },paranoid: false,include:[Avatar] });
    return customer;
  }

  async findDeletedCustomer(customerId:number,transaction?:any)
  {
    const customer = await Customer.findByPk(customerId, { paranoid: false,transaction});
    if (!customer) throw new NotFoundException('Customer not found');
    return customer
  }

  async findDeletedCustomersOlderThan(days: number, transaction?: any) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return Customer.findAll({
          where: { deletedAt: { [Op.lt]: cutoffDate } },
          paranoid: false,
          transaction,
      });
  }
}
