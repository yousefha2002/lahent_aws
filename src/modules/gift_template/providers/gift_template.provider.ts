import { GiftTemplate } from '../entities/gift_template.entity';
import { repositories } from 'src/common/enums/repositories';
export const GiftTemplateProvider = [
    {
        provide: repositories.gift_template_repository,
        useValue: GiftTemplate,
    },
];