import { GiftCategoryLanguage } from '../entites/gift_category_language.entity';
import { GiftCategory } from './../entites/gift_category.entity';
import { repositories } from 'src/common/enums/repositories';
export const GiftCategoryProvider = [
  {
    provide: repositories.gift_category_repository,
    useValue: GiftCategory,
  },
  {
    provide: repositories.gift_categorylanguage__repository,
    useValue: GiftCategoryLanguage,
  },
];
