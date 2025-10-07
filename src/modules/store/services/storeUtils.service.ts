import {Injectable,} from '@nestjs/common';
import { Store } from '../entities/store.entity';
import { getDayOfWeek } from 'src/common/utils/getDayOfWeek';
import { OpeningHour } from 'src/modules/opening_hour/entites/opening_hour.entity';
import { OpeningHourService } from 'src/modules/opening_hour/opening_hour.service';
import { DateTime } from 'luxon';

@Injectable()
export class StoreUtilsService {
    constructor(
        private readonly openingHourService: OpeningHourService
    ) {}
    getStoreTodayHours(store: Store) 
    {
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

    async isStoreOpenAt(storeId: number, date: Date, storeTimeZone: string): Promise<boolean> 
    {
        const dayEnum = getDayOfWeek(date);
        const openingHours: OpeningHour[] = await this.openingHourService.getOpeningHoursByStoreId(storeId);
        const todayOpening = openingHours.find((hour) => hour.day === dayEnum);

        if (!todayOpening || !todayOpening.openTime || !todayOpening.closeTime) return false;

        const [openHour, openMinute] = todayOpening.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = todayOpening.closeTime.split(':').map(Number);

        // تحويل التاريخ للتوقيت المحلي للمتجر
        const checkDate = DateTime.fromJSDate(date).setZone(storeTimeZone);

        let openDate = checkDate.set({ hour: openHour, minute: openMinute, second: 0, millisecond: 0 });
        let closeDate = checkDate.set({ hour: closeHour, minute: closeMinute, second: 0, millisecond: 0 });

        // معالجة الإغلاق بعد منتصف الليل
        if (closeDate <= openDate) {
            closeDate = closeDate.plus({ days: 1 });
        }

        return checkDate >= openDate && checkDate <= closeDate;
    }
}