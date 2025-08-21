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
    async findById(id: number,lang=Language.en) 
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

    async create(lang=Language.en,file?: Express.Multer.File)
    {
        if(!file)
        {
            const message = this.i18n.translate('translation.file_required', { lang });   
            throw new BadRequestException(message)
        }
        const result = await this.cloudinaryService.uploadImage(file);
        const avatar = await this.avatarRepo.create({url: result.secure_url,publicId: result.public_id})
        const message = this.i18n.translate('translation.createdSuccefully', { lang });
        return {avatar,message}
    }
}
