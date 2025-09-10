import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { UserToken } from './entities/user_token.entity';
import { CreateTokenDto } from './dtos/createToken.dto';
import { Op } from 'sequelize';
@Injectable()
export class UserTokenService {
    constructor(
        @Inject(repositories.user_token_repository) private userTokenRepo: typeof UserToken
    ){}

    async createToken(dto: CreateTokenDto) {
        return this.userTokenRepo.create({
        customerId: dto.customerId || null,
        storeId: dto.storeId || null,
        ownerId: dto.ownerId || null,
        role: dto.role,
        refreshToken: dto.refreshToken,
        expiresAt: dto.expiresAt,
        device: dto.device,
        ip: dto.ip,
        });
    }

    async findToken(refreshToken: string) {
        return this.userTokenRepo.findOne({ where: { 
            refreshToken,
            expiresAt: {[Op.gt]: new Date()}}});
    }

    async deleteToken(refreshToken: string) {
        return this.userTokenRepo.destroy({ where: { refreshToken } });
    }

    async rotateToken(token: UserToken,newRefreshToken: string,expiresAt: Date,) 
    {
        token.refreshToken = newRefreshToken;
        token.expiresAt = expiresAt;
        await token.save();
        return token;
    }

    async findTokenByStoreAndOwner(storeId: number, ownerId: number, device?: string, ip?: string) 
    {
        return this.userTokenRepo.findOne({
            where: {
            storeId,
            ownerId,
            ...(device ? { device } : {}),
            ...(ip ? { ip } : {}),
            expiresAt: { [Op.gt]: new Date() }
            },
        });
    }

    deleteByCustomer(customerId:number,transaction?:any)
    {
        return this.userTokenRepo.destroy({where:{customerId},transaction})
    }
}
