import { S3Service } from './../s3/s3.service';
import {BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Avatar } from './entities/avatar.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogService } from '../audit_log/audit_log.service';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class AvatarService {
    constructor(
        @Inject(repositories.avatar_repository) private avatarRepo: typeof Avatar,
        private s3Service:S3Service,
        private readonly i18n: I18nService,
        private readonly auditLogService:AuditLogService
    ){}
    async findById(id: number,lang=Language.ar) 
    {
        const avatar = await this.avatarRepo.findByPk(id)
        if(!avatar)
        {
            const message = this.i18n.translate('translation.not_found', { lang });
            throw new NotFoundException(message)
        }
        return avatar
    }

    findAll()
    {
        return this.avatarRepo.findAll()
    }

    async create(actor:ActorInfo,lang:Language,file?: Express.Multer.File)
    {
        if(!file)
        {
            const message = this.i18n.translate('translation.file_required', { lang });   
            throw new BadRequestException(message)
        }
        const result = await this.s3Service.uploadImage(file);
        const newAvatar = await this.avatarRepo.create({url: result.secure_url,publicId: result.public_id})
        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.AVATAR,
            action: AuditLogAction.CREATE,
            newEntity: newAvatar.get({ plain: true }),
            fieldsToExclude: ['createdAt', 'updatedAt','publicId']
        });
        return {message}
    }

    async update(id: number,actor:ActorInfo, lang : Language, file?: Express.Multer.File) {
        const avatar = await this.findById(id,lang);
        const oldAvatar = { ...avatar.get({ plain: true }) };

        if (!file) {
            const message = this.i18n.translate('translation.file_required', { lang });
            throw new BadRequestException(message);
        }
        if (avatar.publicId) {
            await this.s3Service.deleteImage(avatar.publicId);
        }
        const result = await this.s3Service.uploadImage(file);
        avatar.url = result.secure_url;
        avatar.publicId = result.public_id;
        await avatar.save();
        const newAvatar = await avatar.reload();
        await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.AVATAR,
            action: AuditLogAction.UPDATE,
            oldEntity: oldAvatar,
            newEntity: newAvatar.get({ plain: true }),
            fieldsToExclude: ['createdAt', 'updatedAt','publicId']
        });
        const message = this.i18n.translate('translation.updatedSuccefully', { lang });
        return { message };
    }
}
