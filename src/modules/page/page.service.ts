import { PageLanguage } from './entities/page_language.entity';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { validateRequiredLanguages } from 'src/common/utils/validateLanguages';
import { PageType } from 'src/common/enums/page_type';
import { Language } from 'src/common/enums/language';

@Injectable()
export class PageService {
    constructor(
        @Inject(repositories.page_repository) private pageRepo: typeof Page,
        @Inject(repositories.pageLanguage_repository) private pageLanguageRepo: typeof PageLanguage
    ){}
    
    async createOrUpdatePage(dto: CreatePageDto) {
        validateRequiredLanguages(dto.contents.map(c => c.languageCode), 'Page contents');

        // البحث عن الصفحة حسب الـ type
        let page = await this.pageRepo.findOne({ where: { type: dto.type }, include: [PageLanguage] });

        if (!page) {
            page = await this.pageRepo.create({ type: dto.type });
        }

        for (const content of dto.contents) {
        const existingContent = page.languages?.find(l => l.languageCode === content.languageCode);

        if (existingContent) {
            existingContent.content = content.content;
            await existingContent.save();
        } else {
            await this.pageLanguageRepo.create({
            pageId: page.id,
            languageCode: content.languageCode,
            content: content.content,
            });
        }
        }

        return {success:true}
    }

    async getPageByType(type: PageType,lang:Language) {
        const page = await this.pageRepo.findOne({where: { type },include: [{model:PageLanguage,where:{languageCode:lang}}]});
        if (!page) {
            throw new NotFoundException(`Page with type ${type} not found`);
        }
        return page;
    }
}
