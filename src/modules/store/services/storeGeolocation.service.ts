import { StoreUtilsService } from './storeUtils.service';
import { RecentAddressService } from '../../recent_address/recent_address.service';
import { AddressService } from '../../address/address.service';
import {BadRequestException,Inject,Injectable,NotFoundException,} from '@nestjs/common';
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
        private readonly addressService: AddressService,
        private readonly recentAddressService: RecentAddressService,
    ) {}


    async findStoresNearbyOrBetween(
    dto: GetNearbyStoresDto,
    customerId: number,
    lang = Language.en,
    typeId?: number,
    subTypeId?: number,
    ) {
    const { currentLat, currentLng, targetLat, targetLng, addressId, recentAddressId } = dto;

    if (addressId || recentAddressId || (targetLat !== undefined && targetLng !== undefined)) {
        const targetCoords = await this.getFinalTargetCoordinates(dto, customerId, lang);
        return this.findStoresBetweenPoints(
        currentLat,
        currentLng,
        targetCoords.lat,
        targetCoords.lng,
        lang,
        typeId,
        subTypeId,
        );
    }

    return this.findStoresWithinRadius(currentLat, currentLng, lang, typeId, subTypeId);
    }

    async findStoresWithinRadius(lat: number,lng: number,lang: Language,typeId?: number,subTypeId?: number,) 
    {
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
            {
                model: StoreLanguage,
                where: { languageCode: lang },
            },
            {
            model: SubType,
            ...(typeId && { where: { typeId } }),
            include: [
                { model: SubTypeLanguage,where:{languageCode:lang} },
                { model: Type, include: [{model:TypeLanguage,where:{languageCode:lang}},] },
            ],
            },
            { model: OpeningHour },
        ],
        });

        return stores.map((store) => this.storeUtilsService.mapStoreWithExtras(store));;
    }

    async findStoresBetweenPoints(
        currentLat: number,
        currentLng: number,
        finalTargetLat: number,
        finalTargetLng: number,
        lang: Language,
        typeId?: number,
        subTypeId?: number,
        ) {
        // نحسب مركز الخط
        const centerLat = (currentLat + finalTargetLat) / 2;
        const centerLng = (currentLng + finalTargetLng) / 2;

        // نصف طول الخط بالكيلومتر
        const lineDistanceKm =this.addressService.calculateDistance(currentLat,currentLng,finalTargetLat,finalTargetLng) / 1000; // إذا الدالة بالميتر
        const bufferKm = 0.3; // 300 متر حول الخط
        const radiusKm = lineDistanceKm / 2 + bufferKm;

        // نجيب المتاجر حول مركز الخط فقط
        const stores = await this.storeRepo.findAll({
            where: {
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
            [Op.and]: literal(`
                6371 * 2 * ASIN(
                SQRT(
                    POWER(SIN((lat - ${centerLat}) * PI()/180 / 2), 2) +
                    COS(${centerLat} * PI()/180) * COS(lat * PI()/180) *
                    POWER(SIN((lng - ${centerLng}) * PI()/180 / 2), 2)
                )
                ) <= ${radiusKm}
            `),
            },
            include: [
            {
                model: SubType,
                ...(typeId && { where: { typeId } }),
                include: [
                { model: SubTypeLanguage,where:{languageCode:lang} },
                { model: Type, include: [{model:TypeLanguage,where:{languageCode:lang}},] },
                ],
            },
            {
                model: StoreLanguage,
                where: { languageCode: lang },
            },
            { model: OpeningHour },
            ],
        });

        // نصفي المتاجر بدقة أعلى على الخط
        const result = stores.filter((store) =>
            this.addressService.isBetween(
            store.lat,
            store.lng,
            currentLat,
            currentLng,
            finalTargetLat,
            finalTargetLng,
            300, // buffer بالميتر
            ),
        );

    return result.map((store) =>this.storeUtilsService.mapStoreWithExtras(store),);
    }

    async getFinalTargetCoordinates(
        dto: GetNearbyStoresDto,
        customerId: number,
        lang = Language.en,
    ): Promise<{ lat: number; lng: number }> {
        const { addressId, recentAddressId, targetLat, targetLng, address } = dto;
        if (addressId) {
        const addressEntity = await this.addressService.findOneOrFail(
            addressId,
            customerId,
            lang,
        );
        return { lat: addressEntity.lat, lng: addressEntity.lng };
        }
        if (recentAddressId) {
        const recent = await this.recentAddressService.findOneOrFail(
            recentAddressId,
            customerId,
            lang,
        );
        return { lat: recent.lat, lng: recent.lng };
        }
        if (targetLat && targetLng) {
        await this.recentAddressService.addRecentAddress(customerId, {
            lat: targetLat,
            lng: targetLng,
            address: address ?? 'Unknown',
        });
        return { lat: targetLat, lng: targetLng };
        }
        throw new BadRequestException('Target address information is required');
    }
}