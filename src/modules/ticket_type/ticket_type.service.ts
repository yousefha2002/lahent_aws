import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { TicketType } from './entities/ticket_type.entity';
import { AuditLogService } from '../audit_log/audit_log.service';
import { Sequelize } from 'sequelize';
import { I18nService } from 'nestjs-i18n';
import { CreateTicketTypeDto } from './dto/create_ticket_type.dto';
import { TicketTypeLanguage } from './entities/ticket_type_language.entity';
import { validateRequiredLanguages } from 'src/common/validators/translation-validator.';
import { UpdateTicketTypeDto } from './dto/update_ticket_type.dto';
import { Language } from 'src/common/enums/language';

@Injectable()
export class TicketTypeService {
    constructor(
        @Inject(repositories.ticket_type_repository) private ticketTypeRepo: typeof TicketType,
        @Inject(repositories.ticket_type_language_repository) private ticketTypeLanguageRepo: typeof TicketTypeLanguage,
        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,private readonly i18n: I18nService,
        private readonly auditLogService:AuditLogService
    ){}

    async create(dto: CreateTicketTypeDto, lang: string) {
        const transaction = await this.sequelize.transaction();
        const codes = dto.languages.map((l) => l.languageCode);
        validateRequiredLanguages(codes, 'languages');

        try {
        const ticketType = await this.ticketTypeRepo.create({}, { transaction });

        for (const langObj of dto.languages) {
            await this.ticketTypeLanguageRepo.create({
            ticketTypeId: ticketType.id,
            name: langObj.name,
            languageCode: langObj.languageCode,
            }, { transaction });
        }

        await transaction.commit();
        return {
            message: this.i18n.translate('translation.createdSuccefully', { lang })
        };
        } catch (error) {
        await transaction.rollback();
        throw error;
        }
    }

    async update(id: number, dto: UpdateTicketTypeDto, lang: Language) {
        const transaction = await this.sequelize.transaction();
        try {
        const ticketType = await this.ticketTypeRepo.findByPk(id);
        if (!ticketType) {
            const message = this.i18n.translate('translation.not_found', { lang });
            throw new BadRequestException(message);
        }

        if (dto.languages) {
            for (const langObj of dto.languages) {
            const existingLang = await this.ticketTypeLanguageRepo.findOne({
                where: { ticketTypeId: id, languageCode: langObj.languageCode },
                transaction,
            });

            if (existingLang) {
                existingLang.name = langObj.name ?? existingLang.name;
                await existingLang.save({ transaction });
            } else {
                await this.ticketTypeLanguageRepo.create({
                ticketTypeId: id,
                name: langObj.name,
                languageCode: langObj.languageCode,
                }, { transaction });
            }
            }
        }

        await transaction.commit();
        const message = this.i18n.translate('translation.updatedSuccefully', { lang });
        return { message };
        } catch (error) {
        await transaction.rollback();
        throw error;
        }
    }

    async getAll(lang?: Language) {
        const includeOptions: any = { model: TicketTypeLanguage };
        if (lang) includeOptions.where = { languageCode: lang };

        const types = await this.ticketTypeRepo.findAll({
        include: [includeOptions],
        });
        return types;
    }

    async findOne(id: number) {
    const type = await this.ticketTypeRepo.findByPk(id);
        if (!type) throw new BadRequestException('translation.not_found');
        return type;
    }
}