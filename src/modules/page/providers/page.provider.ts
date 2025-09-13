import { repositories } from 'src/common/enums/repositories';
import { Page } from '../entities/page.entity';
export const PageProvider = [
    {
        provide: repositories.page_repository,
        useValue: Page,
    },
];