import { AuditLogService } from './../audit_log/audit_log.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Sector } from './entities/sector.entity';
import { SectorLanguage } from './entities/sectore_langauge.entity';
import { I18nService } from 'nestjs-i18n';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';
import { Language } from 'src/common/enums/language';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { validateRequiredLanguages, validateUniqueLanguages } from 'src/common/validators/translation-validator.';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';
import { buildMultiLangEntity } from 'src/common/utils/buildMultiLangEntity';

@Injectable()
export class SectorService {
    constructor(
        @Inject(repositories.sector_repository) private sectorRepo: typeof Sector,
        @Inject(repositories.sector_language_repository) private sectorLanguageRepo: typeof SectorLanguage,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        private readonly i18n: I18nService,
        private readonly auditLogService:AuditLogService
    ){}
    async create(dto: CreateSectorDto,actor:ActorInfo, lang: Language) 
    {
        const transaction = await this.sequelize.transaction();
        const codes = dto.languages.map((l) => l.languageCode);
        validateRequiredLanguages(codes, 'sector languages');

        try {
            const sector = await this.sectorRepo.create({}, { transaction });

            for (const langObj of dto.languages) {
                await this.verifyName(langObj.name, langObj.languageCode,undefined);

                await this.sectorLanguageRepo.create(
                {
                    name: langObj.name,
                    languageCode: langObj.languageCode,
                    sectorId: sector.id,
                },
                { transaction },
                );
            }
            const newEntity = buildMultiLangEntity(dto.languages, ['name']);
            await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.SECTOR,
            action: AuditLogAction.CREATE,
            entityId: sector.id,
            newEntity,
            fieldsToExclude: [],
            });

            await transaction.commit();
            const message = this.i18n.translate('translation.createdSuccefully', { lang });
            return { message };
        } catch (error) {
        await transaction.rollback();
        throw error;
        }
    }

    async verifyName(name: string,lang: Language, sectorId?: number) 
    {
        const where: any = {};
        if (sectorId) {
            where.id = { [Op.ne]: sectorId };
        }

        const sector = await this.sectorRepo.findOne({
        where,
        include: [
            {
            model: SectorLanguage,
            where: { name, languageCode: lang },
            required: true,
            },
        ],
        });

        if (sector) {
        const message = this.i18n.translate('translation.sector.name_exists', { lang });
        throw new BadRequestException(message);
        }
        return true;
    }

    async getAll(lang?: Language) 
    {
        const includeOptions: any = { model: SectorLanguage };
        if (lang) {
            includeOptions.where = { languageCode: lang };
        }
        const sectors = await this.sectorRepo.findAll({
            include: [includeOptions],
        });
        return sectors;
    }

    async update(id: number, actor: ActorInfo, dto: UpdateSectorDto, lang: Language) 
    {
        const transaction = await this.sequelize.transaction();

        try {
            const sector = await this.sectorRepo.findByPk(id);
            if (!sector) {
                const message = this.i18n.translate('translation.sector.not_found', { lang });
                throw new BadRequestException(message);
            }

            const oldLanguages = await this.sectorLanguageRepo.findAll({where: { sectorId: id },transaction,});
            const oldTranslationEntity = buildMultiLangEntity(oldLanguages, ['name']);

            if (dto.languages) {
                const codes = dto.languages.map((l) => l.languageCode);
                validateUniqueLanguages(codes, 'sector languages');

                for (const langObj of dto.languages) {
                await this.verifyName(langObj.name, langObj.languageCode, id);

                const existingLang = await this.sectorLanguageRepo.findOne({
                    where: {
                    sectorId: id,
                    languageCode: langObj.languageCode,
                    },
                    transaction,
                });

                if (existingLang) {
                    existingLang.name = langObj.name;
                    await existingLang.save({ transaction });
                } else {
                    await this.sectorLanguageRepo.create(
                    {
                        name: langObj.name,
                        languageCode: langObj.languageCode,
                        sectorId: sector.id,
                    },
                    { transaction },
                    );
                }
                }
            }

            const newLanguages = await this.sectorLanguageRepo.findAll({where: { sectorId: id },transaction,});
            const newTranslationEntity = buildMultiLangEntity(newLanguages, ['name']);

            await this.auditLogService.logChange({
                actor,
                entity: AuditLogEntity.SECTOR,
                action: AuditLogAction.UPDATE,
                entityId: sector.id,
                oldEntity:oldTranslationEntity,
                newEntity:newTranslationEntity,
            });

            await transaction.commit();

            const message = this.i18n.translate('translation.updatedSuccefully', { lang });
            return { message };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findOne(sectorId:number)
    {
        const sector = await this.sectorRepo.findByPk(sectorId)
        if(!sector)
        {
            throw new NotFoundException('sector is not found')
        }
        return sector
    }
}
