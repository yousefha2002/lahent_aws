import { getOfferEndDate } from "src/common/utils/getOfferEndDate";
import { Offer } from "../entities/offer.entity";
import { TargetType } from "src/common/enums/target_type";

interface MapOfferOptions {
    includeStore?: boolean;
    includeUsedCount?: boolean;
}

export function mapOfferToResponse(offer: Offer,options: MapOfferOptions = {},) 
{
    const endDate = getOfferEndDate(offer.startDate, offer.durationUnit, offer.duration);
    const response: any = {
        ...offer.toJSON(),
        endDate,
        usedCount:options.includeUsedCount&&offer.usedCount
    };

    if (options.includeStore) {
        response.store = {...offer.store.toJSON()};
    }
    response.products = [];
    response.moreProducts = 0;
    response.totalProducts = 0;
    response.categories = [];

    if (offer.target === TargetType.PRODUCT) {
        const products = offer.products || [];
        response.products = products.slice(0, 2).map((p) => ({
        id: p.id,
        image: p.images?.[0]?.imageUrl || null,
        }));
        response.moreProducts = Math.max(0, products.length - 2);
        response.totalProducts = products.length;
    }

    if (offer.target === TargetType.CATEGROY) {
        const categories = offer.categories || [];
        response.categories = categories.map((c) => ({
            ...c.toJSON()
        }));
    }
    return response;
}