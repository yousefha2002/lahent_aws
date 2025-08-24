import {Injectable,} from '@nestjs/common';
import { Store } from '../entities/store.entity';
import { getDayOfWeek } from 'src/common/utils/getDayOfWeek';

@Injectable()
export class StoreUtilsService {
    constructor() {}
    getStoreTodayHours(store: Store) {
        const todayEnum = getDayOfWeek();
        const todayOpening = store.openingHours?.find(
        (hour) => hour.day === todayEnum,
        );

        return {
        openTime: todayOpening?.openTime ?? null,
        closeTime: todayOpening?.closeTime ?? null,
        };
    }

    mapStoreWithExtras(store: Store) {
    const { openTime, closeTime } = this.getStoreTodayHours(store);
    return {
        ...store.toJSON(),
        openTime,
        closeTime,
    };
    }
}