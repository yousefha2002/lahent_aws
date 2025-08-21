import { StoreUtilsService } from './storeUtils.service';
import { RecentAddressService } from '../../recent_address/recent_address.service';
import { AddressService } from '../../address/address.service';
import {BadRequestException,Inject,Injectable,NotFoundException,} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
import { GetNearbyStoresDto } from '../dto/get-nearby-store.dto';
import { StoreStatus } from 'src/common/enums/store_status';
import { Op } from 'sequelize';
import { OpeningHour } from '../../opening_hour/entites/opening_hour.entity';
import { Type } from '../../type/entities/type.entity';
import { TypeLanguage } from '../../type/entities/type_language.entity';
import { Language } from 'src/common/enums/language';
import { SubType } from '../../subtype/entities/subtype.entity';
import { SubTypeLanguage } from '../../subtype/entities/sybtype_language.entity';
import { RADIS_KM } from 'src/common/constants';

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
        const degreeRadius = RADIS_KM / 111;

        const minLat = lat - degreeRadius;
        const maxLat = lat + degreeRadius;
        const minLng = lng - degreeRadius;
        const maxLng = lng + degreeRadius;

        const stores = await this.storeRepo.findAll({
        where: {
            lat: { [Op.between]: [minLat, maxLat] },
            lng: { [Op.between]: [minLng, maxLng] },
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
        },
        include: [
            {
            model: SubType,
            ...(typeId && { where: { typeId } }),
            include: [
                { model: SubTypeLanguage },
                { model: Type, include: [TypeLanguage] },
            ],
            },
            { model: OpeningHour },
        ],
        });

        const result = stores.filter(store => {
            const distance = this.addressService.calculateDistance(lat, lng, store.lat, store.lng);
            return distance <= RADIS_KM;
        })

        return result.map((store) => this.storeUtilsService.mapStoreWithExtras(store, lang));;
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
        const offset = 0.002;
        const minLat = Math.min(currentLat, finalTargetLat) - offset;
        const maxLat = Math.max(currentLat, finalTargetLat) + offset;
        const minLng = Math.min(currentLng, finalTargetLng) - offset;
        const maxLng = Math.max(currentLng, finalTargetLng) + offset;

        const stores = await this.storeRepo.findAll({
        where: {
            lat: { [Op.between]: [minLat, maxLat] },
            lng: { [Op.between]: [minLng, maxLng] },
            status: StoreStatus.APPROVED,
            ...(subTypeId && { subTypeId }),
        },
        include: [
            {
            model: SubType,
            ...(typeId && { where: { typeId } }),
            include: [
                { model: SubTypeLanguage },
                { model: Type, include: [TypeLanguage] },
            ],
            },
            { model: OpeningHour },
        ],
        });

        const result = stores.filter(store =>
            this.addressService.isBetween(
            store.lat,
            store.lng,
            currentLat,
            currentLng,
            finalTargetLat,
            finalTargetLng,
            ),
        );

        return result.map((store) => this.storeUtilsService.mapStoreWithExtras(store, lang));;
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