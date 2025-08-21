import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Favorite } from './entities/favirote.entity';
import { repositories } from 'src/common/enums/repositories';
import { StoreService } from '../store/services/store.service';
import { Language } from 'src/common/enums/language';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class FaviroteService {
  constructor(
    @Inject(repositories.favirote_repository)
    private favoriteModel: typeof Favorite,
    private readonly storeService: StoreService,
    private readonly i18n: I18nService,
  ) {}

  // إضافة متجر للمفضلة
  async addFavorite(customerId: number, storeId: number, lang: Language = Language.en) {
    const store = await this.storeService.storeById(storeId);

    if (!store) {
      throw new NotFoundException(
        this.i18n.translate('translation.invalid_store', { lang }),
      );
    }

    const [favorite] = await this.favoriteModel.findOrCreate({
      where: { customerId, storeId },
      defaults: { customerId, storeId },
    });

    return favorite;
  }

  // إزالة متجر من المفضلة
  async removeFavorite(customerId: number, storeId: number, lang: Language = Language.en) {
    const fav = await this.favoriteModel.findOne({
      where: { customerId, storeId },
    });

    if (!fav) {
      throw new NotFoundException(
        this.i18n.translate('translation.favorite_not_found', { lang }),
      );
    }

    await fav.destroy();
    return { message: this.i18n.translate('translation.removed_from_favorites', { lang }) };
  }
}