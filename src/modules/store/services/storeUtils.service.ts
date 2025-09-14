import {Injectable,} from '@nestjs/common';
import { Store } from '../entities/store.entity';
import { getDayOfWeek } from 'src/common/utils/getDayOfWeek';
import { OpeningHour } from 'src/modules/opening_hour/entites/opening_hour.entity';
import { OpeningHourService } from 'src/modules/opening_hour/opening_hour.service';

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

    async isStoreOpenAt(storeId: number, date: Date): Promise<boolean> 
    {
        const dayEnum = getDayOfWeek(date);
    
        const openingHours: OpeningHour[] = await this.openingHourService.getOpeningHoursByStoreId(storeId);
        const todayOpening = openingHours.find((hour) => hour.day === dayEnum);
    
        if (!todayOpening) return false;
    
        if (!todayOpening.openTime || !todayOpening.closeTime) return false;
    
        const openTimeParts = todayOpening.openTime.split(':');
        const closeTimeParts = todayOpening.closeTime.split(':');
    
        const openDate = new Date(date);
        openDate.setHours(parseInt(openTimeParts[0]),parseInt(openTimeParts[1]),0,0,);
    
        const closeDate = new Date(date);
        closeDate.setHours(parseInt(closeTimeParts[0]),parseInt(closeTimeParts[1]),0,0,);
    
        // معالجة حالة الإغلاق بعد منتصف الليل
        if (closeDate <= openDate) {
          // إذا وقت الإغلاق أقل أو يساوي وقت الفتح => يعني الإغلاق في اليوم التالي
            closeDate.setDate(closeDate.getDate() + 1);
        }
        return date >= openDate && date <= closeDate;
    }
}