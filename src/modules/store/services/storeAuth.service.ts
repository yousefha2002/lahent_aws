import { StoreService } from './store.service';
import {BadRequestException,forwardRef,Inject,Injectable,NotFoundException,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateStoreDto } from '../dto/create-store.dto';
import { comparePassword, hashPassword } from 'src/common/utils/password';
import { UploadApiResponse } from 'cloudinary';
import { OpeningHourEnum } from 'src/common/validation/validateAndParseOpeningHours';
import { OpeningHourService } from '../../opening_hour/opening_hour.service';
import { LoginStoreDto } from '../dto/store-login.dto';
import { RoleStatus } from 'src/common/enums/role_status';
import { SubtypeService } from '../../subtype/subtype.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { generateAccessToken, generateRefreshToken } from 'src/common/utils/generateToken';
import { JwtService } from '@nestjs/jwt';
import { validateAndParseStoreTranslations } from 'src/common/validation/translationDto/storeTranslation.dto';
import { StoreLanguage } from '../entities/store_language.entity';

@Injectable()
export class StoreAuthService {
    constructor(
        @Inject(repositories.store_repository) private storeRepo: typeof Store,
        @Inject(repositories.store_langauge_repository) private storeLanguageRepo: typeof StoreLanguage,
        private readonly cloudinaryService: CloudinaryService,
        private readonly openingHourService: OpeningHourService,
        @Inject(forwardRef(() => SubtypeService))
        private subTypeService: SubtypeService,
        private readonly i18n: I18nService, 
        private jwtService: JwtService,
        private storeService:StoreService
    ) {}

    async create(dto: CreateStoreDto,ownerId: string,hours: OpeningHourEnum[],logo: Express.Multer.File,cover: Express.Multer.File,lang=Language.en) 
    {
        const translations = validateAndParseStoreTranslations(dto.translations);
        await Promise.all([
        this.checkIfPhoneUsed(dto.phone),
        this.checkIfPhoneLoginUsed(dto.phoneLogin),
        this.subTypeService.subTypeById(+dto.subTypeId),
        ]);

        const [logoUpload, coverUpload] = await Promise.all([
        this.cloudinaryService.uploadImage(logo),
        this.cloudinaryService.uploadImage(cover),
        ]);

        const newStore = await this.creataionOfStore(
        ownerId,
        dto,
        logoUpload,
        coverUpload,
        );

        await Promise.all(
            translations.map((t) =>
            this.storeLanguageRepo.create({
                storeId: newStore.id,
                languageCode: t.languageCode,
                name: t.name,
            }),
            ),
        );
        await this.openingHourService.createOpiningHourForStore(newStore.id, hours);

        return { message: this.i18n.t('translation.store.created',{lang}) };
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

    async creataionOfStore(
        ownerId: string,
        dto: CreateStoreDto,
        logoUpload: UploadApiResponse,
        coverUpload: UploadApiResponse,
    ) {
        const passwordHashed = await hashPassword(dto.password);
        const storeCreated = await this.storeRepo.create({
        phone: dto.phone,
        phoneLogin: dto.phoneLogin,
        lat: dto.lat,
        lng: dto.lng,
        city: dto.city,
        password: passwordHashed,
        subTypeId: dto.subTypeId,
        logoUrl: logoUpload.secure_url,
        logoPublicId: logoUpload.public_id,
        coverUrl: coverUpload.secure_url,
        coverPublicId: coverUpload.public_id,
        ownerId: ownerId,
        in_store: dto.in_store,
        drive_thru: dto.drive_thru,
        commercialRegister: dto.commercialRegister,
        taxNumber: dto.taxNumber,
        });
        return storeCreated;
    }

    async login(dto: LoginStoreDto,lang=Language.en) {
        const storeByPass = await this.storeRepo.findOne({
        where: { phoneLogin: dto.phone },
        });
        if (!storeByPass) {
        throw new NotFoundException(this.i18n.t('translation.auth.invalidPhone',{lang})); // ✅ مترجمة
        }

        const isMatch = await comparePassword(dto.password, storeByPass.password);
        if (!isMatch) {
        throw new BadRequestException(this.i18n.t('translation.auth.invalidPassword',{lang})); // ✅ مترجمة
        }

        const payload = { id: storeByPass.id, role: RoleStatus.STORE };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload)
        storeByPass.refreshToken = refreshToken
        await storeByPass.save()

        return {
        store: storeByPass,
        accessToken,
        refreshToken
        };
    }

    async refreshToken(refreshToken:string)
    {
        try {
            const decoded = await this.jwtService.verifyAsync(refreshToken, {secret: 'refresh_token',});
            const store = await this.storeService.storeById(decoded.id);
            
            if (store&&store.refreshToken !== refreshToken) {
            throw new BadRequestException('Invalid refresh token');
            }
            const accessToken = generateAccessToken({ id: store?.id, role: decoded.role });
            return { accessToken };
        } catch (err) {
            throw new BadRequestException('Invalid or expired refresh token');
        }
    }
}