import { StoreUtilsService } from './storeUtils.service';
import { AddressService } from '../../address/address.service';
import {BadRequestException,Inject,Injectable,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
import { GetNearbyStoresDto } from '../dto/get-nearby-store.dto';
import { StoreStatus } from 'src/common/enums/store_status';
import { literal, Op } from 'sequelize';
import { OpeningHour } from '../../opening_hour/entites/opening_hour.entity';
import { Type } from '../../type/entities/type.entity';
import { TypeLanguage } from '../../type/entities/type_language.entity';
import { Language } from 'src/common/enums/language';
import { SubType } from '../../subtype/entities/subtype.entity';
import { SubTypeLanguage } from '../../subtype/entities/sybtype_language.entity';
import { RADIS_KM } from 'src/common/constants';
import { StoreLanguage } from '../entities/store_language.entity';

@Injectable()
export class StoreGeolocationService {
    constructor(
        @Inject(repositories.store_repository)
        private storeRepo: typeof Store,
        private readonly storeUtilsService: StoreUtilsService,
    ) {}


    async findStoresNearbyOrBetween(
    dto: GetNearbyStoresDto ,
    lang :Language,
    page:number,
    limit:number,
    typeId?: number,
    subTypeId?: number,
    ) {
    const {currentLat,currentLng,targetLat,targetLng} = dto
    if (targetLat !== undefined && targetLng !== undefined) {
        return this.findStoresBetweenPoints(
        currentLat,
        currentLng,
        targetLat,
        targetLng,
        lang,
        page,
        limit,
        typeId,
        subTypeId,
        );
    }

    return this.findStoresWithinRadius(currentLat, currentLng, lang,page,limit, typeId, subTypeId);
    }

    async findStoresWithinRadius(lat: number,lng: number,lang: Language,page:number,limit:number,typeId?: number,subTypeId?: number) 
    {
        const offset = (page - 1) * limit;
        const totalItems = await this.storeRepo.count({
            where: {
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
            [Op.and]: literal(`
                6371 * 2 * ASIN(
                SQRT(
                    POWER(SIN((lat - ${lat}) * PI()/180 / 2), 2) +
                    COS(${lat} * PI()/180) * COS(lat * PI()/180) *
                    POWER(SIN((lng - ${lng}) * PI()/180 / 2), 2)
                )
                ) <= ${RADIS_KM}
            `)
            },
        });

        const stores = await this.storeRepo.findAll({
            where: {
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
            [Op.and]: literal(`
                6371 * 2 * ASIN(
                SQRT(
                    POWER(SIN((lat - ${lat}) * PI()/180 / 2), 2) +
                    COS(${lat} * PI()/180) * COS(lat * PI()/180) *
                    POWER(SIN((lng - ${lng}) * PI()/180 / 2), 2)
                )
                ) <= ${RADIS_KM}
            `)
            },
            include: [
            { model: StoreLanguage, where: { languageCode: lang } },
            { model: SubType, ...(typeId && { where: { typeId } }),
                include: [
                { model: SubTypeLanguage, where: { languageCode: lang } },
                { model: Type, include: [{ model: TypeLanguage, where: { languageCode: lang } }] },
                ]
            },
            { model: OpeningHour },
            ],
            order: literal(`
            6371 * 2 * ASIN(
                SQRT(
                POWER(SIN((lat - ${lat}) * PI()/180 / 2), 2) +
                COS(${lat} * PI()/180) * COS(lat * PI()/180) *
                POWER(SIN((lng - ${lng}) * PI()/180 / 2), 2)
                )
            )
            `),
            limit,
            offset,
        });

        return {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            stores: stores.map(store => this.storeUtilsService.mapStoreWithExtras(store)),
        };
    }

    async findStoresBetweenPoints(
    currentLat: number,
    currentLng: number,
    finalTargetLat: number,
    finalTargetLng: number,
    lang: Language,
    page: number,
    limit: number,
    typeId?: number,
    subTypeId?: number,
    ) {
        const offset = (page - 1) * limit;
        const bufferMeters = 300; // مسافة السماح حول الخط بالمتر

        // نحول المسافة بالمتر إلى درجة تقريباً
        const degToKm = 111; // 1 درجة ~ 111 كم تقريباً
        const bufferDeg = bufferMeters / 1000 / degToKm;

        // معادلة تقريبية للمسافة العمودية على الخط
        const distanceSql = `
            ABS((${finalTargetLng} - ${currentLng}) * (lat - ${currentLat}) - (${finalTargetLat} - ${currentLat}) * (lng - ${currentLng})) 
            / SQRT(POWER((${finalTargetLng} - ${currentLng}), 2) + POWER((${finalTargetLat} - ${currentLat}), 2))
        `;

        // تعداد إجمالي
        const totalItems = await this.storeRepo.count({
            where: {
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
            [Op.and]: literal(`${distanceSql} <= ${bufferDeg}`),
            },
        });

        // جلب المتاجر مع pagination وترتيب حسب الأقرب للخط
        const stores = await this.storeRepo.findAll({
            where: {
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
            [Op.and]: literal(`${distanceSql} <= ${bufferDeg}`),
            },
            include: [
            {
                model: SubType,
                ...(typeId && { where: { typeId } }),
                include: [
                { model: SubTypeLanguage, where: { languageCode: lang } },
                { model: Type, include: [{ model: TypeLanguage, where: { languageCode: lang } }] },
                ],
            },
            { model: StoreLanguage, where: { languageCode: lang } },
            { model: OpeningHour },
            ],
            offset,
            limit,
            order: literal(`
            SQRT(
                POWER(lat - ${currentLat}, 2) + POWER(lng - ${currentLng}, 2)
            )
            `), // ترتيب حسب الأقرب من نقطة البداية
        });

        return {
            totalItems,
            stores: stores.map(store => this.storeUtilsService.mapStoreWithExtras(store)),
            totalPages: Math.ceil(totalItems / limit)
        };
    }
}