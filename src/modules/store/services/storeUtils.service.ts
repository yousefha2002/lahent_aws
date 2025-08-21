import {Injectable,} from '@nestjs/common';
import { Store } from '../entities/store.entity';
import { Language } from 'src/common/enums/language';
import { getDayOfWeek } from 'src/common/utils/getDayOfWeek';

@Injectable()
export class StoreUtilsService {
    constructor(
    ) {}

    getStoreTypeObject(store: Store, lang: Language) {
    const typeLang = store.subType.languages.find(
        (tl) => tl.languageCode === lang,
    );
    const parentTypeLang = store.subType.type.languages.find(
        (tl) => tl.languageCode === lang,
    );

    return {
        id: store.subType.id,
        name: typeLang?.name ?? store.subType.languages[0]?.name ?? 'Unknown',
        type: {
        id: store.subType.type.id,
        name:
            parentTypeLang?.name ??
            store.subType.type.languages[0]?.name ??
            'Unknown',
        iconUrl: store.subType.type.iconUrl,
        },
    };
    }

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

    mapStoreWithExtras(store: Store, lang: Language) {
    const { openTime, closeTime } = this.getStoreTodayHours(store);
    return {
        ...store.toJSON(),
        openTime,
        closeTime,
        subType: this.getStoreTypeObject(store, lang),
    };
    }
}