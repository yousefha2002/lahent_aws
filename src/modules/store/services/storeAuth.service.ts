import { S3Service } from './../../s3/s3.service';
import { SectorService } from './../../sector/sector.service';
import { UserTokenService } from './../../user_token/user_token.service';
import { StoreService } from './store.service';
import {BadRequestException,ForbiddenException,forwardRef,Inject,Injectable,NotFoundException,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
import { CreateStoreDto } from '../dto/requests/create-store.dto';
import { comparePassword, hashPassword } from 'src/common/utils/password';
import { OpeningHourEnum } from 'src/common/validators/validateAndParseOpeningHours';
import { OpeningHourService } from '../../opening_hour/opening_hour.service';
import { LoginStoreDto } from '../dto/requests/store-login.dto';
import { RoleStatus } from 'src/common/enums/role_status';
import { SubtypeService } from '../../subtype/subtype.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { generateTokens } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';
import { validateAndParseStoreTranslations } from 'src/common/validators/validate-store-translations.validator';
import { StoreLanguage } from '../entities/store_language.entity';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';
import { Sequelize } from 'sequelize';
import { InitialCreateStoreDto } from '../dto/requests/initial-create-store.dto';
import { UpdatePasswordDto } from '../dto/requests/update-password.dto';
import { SelectOwnerForStoreDto } from '../dto/requests/selectStoreForOwner.dto';
import { RefreshTokenDto } from 'src/modules/user_token/dtos/refreshToken.dto';
import { validateRequiredLanguages } from 'src/common/validators/translation-validator.';

@Injectable()
export class StoreAuthService {
    constructor(
        @Inject(repositories.store_repository) private storeRepo: typeof Store,
        @Inject(repositories.store_langauge_repository) private storeLanguageRepo: typeof StoreLanguage,
        private readonly s3Service: S3Service,
        private readonly openingHourService: OpeningHourService,
        @Inject(forwardRef(() => SubtypeService))
        private subTypeService: SubtypeService,
        private readonly i18n: I18nService, 
        private jwtService: JwtService,
        private storeService:StoreService,
        private userTokenService:UserTokenService,
        private sectorService:SectorService,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize
    ) {}

    async initialCreation(ownerId: number, dto: InitialCreateStoreDto,lang:Language) 
    {
        const transaction = await this.sequelize.transaction();
        try {
            const languageCodes = dto.languages.map(l => l.languageCode);
            validateRequiredLanguages(languageCodes, 'store translations');
            await this.sectorService.findOne(+dto.sectorId);
            const existingStore = await this.storeRepo.findOne({where: { ownerId, isCompletedProfile: false },transaction});
            if (existingStore) {
            for (const lang of dto.languages) {
                const storeLang = await this.storeLanguageRepo.findOne({
                where: { storeId: existingStore.id, languageCode: lang.languageCode },
                transaction,
                });

                if (storeLang) {
                await storeLang.update({ brand: lang.brand }, { transaction });
                } else {
                await this.storeLanguageRepo.create(
                    { storeId: existingStore.id, languageCode: lang.languageCode, brand: lang.brand },{ transaction },
                );
                }
            }

            existingStore.sectorId = +dto.sectorId;
            await existingStore.save({ transaction });

            await transaction.commit();
            return { message: this.i18n.t('translation.store.updated', { lang }) };
            }
            const store = await this.storeRepo.create({ownerId,sectorId: +dto.sectorId,isCompletedProfile: false},{ transaction });
            for (const lang of dto.languages) {
                await this.storeLanguageRepo.create(
                    { storeId: store.id, languageCode: lang.languageCode, brand: lang.brand },
                    { transaction },
                );
            }

            await transaction.commit();
            return { message: this.i18n.t('translation.store.created', { lang }) };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async create(dto: CreateStoreDto,ownerId: string,hours: OpeningHourEnum[],lang : Language,logo?: Express.Multer.File,cover?: Express.Multer.File,commercialRegisterFile?: Express.Multer.File,taxNumberFile?: Express.Multer.File)
    {
        const transaction = await this.sequelize.transaction();
        try {
            const store = await this.storeRepo.findOne({ where: { ownerId, isCompletedProfile: false }, transaction });
            if (!store) {
                throw new BadRequestException(this.i18n.t('translation.store.noIncompleteStore', { lang }));
            }

            const translations = validateAndParseStoreTranslations(dto.translations);
            // تحقق الاسم داخل نفس اللغة
            for (const t of translations) {
            const exists = await this.storeLanguageRepo.findOne({
                where: { name: t.name, languageCode: t.languageCode },
                transaction,
            });
            if (exists) {
                throw new BadRequestException(
                this.i18n.t('translation.store.nameAlreadyExists', { lang }),
                );
            }
            }

            await Promise.all([
                this.checkIfPhoneUsed(dto.phone),
                this.checkIfPhoneLoginUsed(dto.phoneLogin),
                this.subTypeService.subTypeById(+dto.subTypeId),
            ]);

            let logoUpload: any | undefined;
            let coverUpload: any | undefined;
            let commercialRegisterUpload: any | undefined;
            let taxNumberUpload: any | undefined;
            if (logo) logoUpload = await this.s3Service.uploadImage(logo);
            if (cover) coverUpload = await this.s3Service.uploadImage(cover);
            if (commercialRegisterFile) commercialRegisterUpload = await this.s3Service.uploadImage(commercialRegisterFile);
            if (taxNumberFile) taxNumberUpload = await this.s3Service.uploadImage(taxNumberFile);

            const newStore = await store.update({
                phone: dto.phone,
                phoneLogin: dto.phoneLogin,
                lat: dto.lat,
                lng: dto.lng,
                city: dto.city,
                password: await hashPassword(dto.password),
                subTypeId: dto.subTypeId,
                inStore: dto.inStore,
                driveThru: dto.driveThru,
                commercialRegister: dto.commercialRegister,
                taxNumber: dto.taxNumber,
                isCompletedProfile:true,
                ...(logoUpload ? { logoUrl: logoUpload.secure_url, logoPublicId: logoUpload.public_id } : {}),
                ...(coverUpload ? { coverUrl: coverUpload.secure_url, coverPublicId: coverUpload.public_id } : {}),
                ...(commercialRegisterUpload? {commercialRegisterUrl: commercialRegisterUpload.secure_url,commercialRegisterPublicId: commercialRegisterUpload.public_id}: {}),
                ...(taxNumberUpload? {taxNumberUrl: taxNumberUpload.secure_url,taxNumberPublicId: taxNumberUpload.public_id,}: {}),
            }, { transaction });

            for (const t of translations) {
            const storeLang = await this.storeLanguageRepo.findOne({
                where: { storeId: store.id, languageCode: t.languageCode },
                transaction,
            });

            if (storeLang) {
                await storeLang.update({ name: t.name }, { transaction });
            }
            }

            await this.openingHourService.createOpiningHourForStore(newStore.id,hours,transaction);
            await transaction.commit();
            return { message: this.i18n.t('translation.store.created', { lang }) };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async checkIfPhoneUsed(phone: string,lang=Language.en) {
        const store = await this.storeRepo.findOne({ where: { phone } });
        if (store) {
        throw new BadRequestException(this.i18n.t('translation.store.phoneInUse',{lang}));
        }
        return false;
    }

    async checkIfPhoneLoginUsed(phone: string,lang=Language.en) {
        const store = await this.storeRepo.findOne({
        where: { phoneLogin: phone },
        });
        if (store) {
        throw new BadRequestException(this.i18n.t('translation.store.loginPhoneInUse',{lang}));
        }
        return false;
    }

    async login(dto: LoginStoreDto,lang:Language) {
        const storeByPass = await this.storeRepo.findOne({
            where: { phoneLogin: dto.phone },
            include:[{model:StoreLanguage,where:{languageCode:lang}}]
        });
        if (!storeByPass) {
            throw new NotFoundException(this.i18n.t('translation.auth.invalidPasswordOrPhone',{lang}));
        }

        const isMatch = await comparePassword(dto.password, storeByPass.password);
        if (!isMatch) {
        throw new BadRequestException(this.i18n.t('translation.auth.invalidPasswordOrPhone',{lang}));
        }
        const tokens = generateTokens(storeByPass.id, RoleStatus.STORE);
        const existingToken = await this.userTokenService.findExistingToken(RoleStatus.STORE,storeByPass.id,dto.deviceId);
        if(existingToken)
        {
            await this.userTokenService.rotateToken(existingToken,tokens.refreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS))
            await existingToken.save();
        }
        else{
            await this.userTokenService.createToken({
                storeId: storeByPass.id,
                role: RoleStatus.STORE,
                refreshToken:tokens.refreshToken,
                expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
                deviceId:dto.deviceId
            });
        }
        await storeByPass.save()
        await storeByPass.update({ lastLoginAt: new Date() });

        return {store: storeByPass,accessToken:tokens.accessToken,refreshToken:tokens.refreshToken};
    }

    async refreshToken(dto:RefreshTokenDto)
    {
        const {refreshToken,deviceId} = dto
        try {
            const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token',});
            const tokenRecord = await this.userTokenService.findTokenForRefreshing(refreshToken,deviceId);
            if (!tokenRecord) {
                throw new BadRequestException('Invalid or expired refresh token');
            }
            const store = await this.storeService.getStoreById(decoded.id);
            const tokens = generateTokens(store.id, RoleStatus.STORE);
            await this.userTokenService.rotateToken(tokenRecord,tokens.refreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),);

            return {accessToken:tokens.accessToken,refreshToken:tokens.refreshToken};
        } catch (err) {
            throw new BadRequestException('Invalid or expired refresh token');
        }
    }

    async selectStoreForOnwer(storeId:number,ownerId:number,dto:SelectOwnerForStoreDto,lang:Language,device?:string,ip?:string)
    {
        const {deviceId} = dto
        const store = await this.storeRepo.findOne({where:{id:storeId,ownerId},include:[{model:StoreLanguage,where:{languageCode:lang}}]})
        if(!store)
        {
            throw new ForbiddenException('You are not the owner of the store')
        }
        const tokens = generateTokens(store.id, RoleStatus.STORE);
        const existingToken = await this.userTokenService.findExistingToken(RoleStatus.STORE,storeId,deviceId);

        if (existingToken) {
            await this.userTokenService.rotateToken(
                existingToken,
                tokens.refreshToken,
                new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
            );
        } else {
            await this.userTokenService.createToken({
            ownerId:ownerId,
            storeId: store.id,
            role: RoleStatus.STORE,
            refreshToken:tokens.refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
            deviceId
        });
        }
        return { accessToken:tokens.accessToken ,refreshToken:tokens.refreshToken,store};
    }

    async updatePassword(store:Store,dto:UpdatePasswordDto)
    {
        const {oldPassword,newPassword} = dto
        const isMatch = await comparePassword(oldPassword, store.password);
        if (!isMatch) {
            throw new BadRequestException('Old password is incorrect');
        }
        const hashedPassword = await hashPassword(newPassword);
        store.password = hashedPassword;
        await store.save();
        return { message: 'Password updated successfully' };
    }
}