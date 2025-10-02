import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Avatar } from './entities/avatar.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class AvatarService {
    constructor(
        @Inject(repositories.avatar_repository) private avatarRepo: typeof Avatar,
        private cloudinaryService:CloudinaryService,
        private readonly i18n: I18nService,
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

    async create(lang:Language,file?: Express.Multer.File)
    {
        if(!file)
        {
            const message = this.i18n.translate('translation.file_required', { lang });   
            throw new BadRequestException(message)
        }
        const result = await this.cloudinaryService.uploadImage(file);
        await this.avatarRepo.create({url: result.secure_url,publicId: result.public_id})
        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return {message}
    }

    async update(id: number, lang : Language, file?: Express.Multer.File) {
        const avatar = await this.findById(id,lang);

        if (!file) {
            const message = this.i18n.translate('translation.file_required', { lang });
            throw new BadRequestException(message);
        }
        if (avatar.publicId) {
            await this.cloudinaryService.deleteImage(avatar.publicId);
        }
        const result = await this.cloudinaryService.uploadImage(file);
        avatar.url = result.secure_url;
        avatar.publicId = result.public_id;
        await avatar.save();

        const message = this.i18n.translate('translation.updatedSuccefully', { lang });
        return { message };
    }
}
