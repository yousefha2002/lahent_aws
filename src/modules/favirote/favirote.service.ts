import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    @Inject(forwardRef(() => StoreService)) private storeService: StoreService,
    private readonly i18n: I18nService,
  ) {}

  async toggleFavorite(customerId: number, storeId: number, lang: Language = Language.en)
  {
    const store = await this.storeService.getStoreById(storeId);
    const favorite = await this.findFavoriteStore(storeId,customerId)

    if (favorite) {
      await favorite.destroy();
      return { message: this.i18n.translate('translation.removed_from_favorites', { lang }) };
    } else {
      await this.favoriteModel.create({ customerId, storeId });
      return { message: this.i18n.translate('translation.added_to_favorites', { lang })};
    }
  }

  async removeFavorite(customerId: number, storeId: number, lang: Language = Language.en) {
    const favorite = await this.findFavoriteStore(storeId,customerId)

    if (!favorite) {
      throw new NotFoundException(
        this.i18n.translate('translation.favorite_not_found', { lang }),
      );
    }

    await favorite.destroy();
    return { message: this.i18n.translate('translation.removed_from_favorites', { lang }) };
  }

  findFavoriteStore(storeId:number,customerId:number)
  {
    return this.favoriteModel.findOne({where: { customerId, storeId },});
  }

  async deleteAllFavoriteByStore(storeId: number, transaction?: any) {
    await this.favoriteModel.destroy({
      where: { storeId },
      transaction,
    });
  }
}