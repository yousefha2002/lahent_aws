import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { UserToken } from './entities/user_token.entity';
import { CreateTokenDto } from './dtos/createToken.dto';
import { Op } from 'sequelize';
import { RoleStatus } from 'src/common/enums/role_status';
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
        lastLoginAt: new Date(),
        deviceId:dto.deviceId
        });
    }

    async findTokenForRefreshing(refreshToken: string,deviceId:string) {
        return this.userTokenRepo.findOne({ where: {  refreshToken, deviceId,isRevoked:false,expiresAt: {[Op.gt]: new Date()}}});
    }

    async deleteToken(refreshToken: string) {
        return this.userTokenRepo.destroy({ where: { refreshToken } });
    }

    async findExistingToken(role: RoleStatus, userId: number, deviceId: string) 
    {
        const whereClause: any = {role,isRevoked:false,deviceId,expiresAt: { [Op.gt]: new Date() }};
        if (role === 'store') whereClause.storeId = userId;
        else if (role === 'owner') whereClause.ownerId = userId;
        else if (role === 'customer') whereClause.customerId = userId;
        return this.userTokenRepo.findOne({ where: whereClause });
    }

    async rotateToken(token: UserToken,newRefreshToken: string,expiresAt: Date,) 
    {
        token.refreshToken = newRefreshToken;
        token.expiresAt = expiresAt;
        await token.save();
        return token;
    }

    async logout(role: RoleStatus, userId: number, deviceId: string) 
    {
        const token = await this.findExistingToken(role, userId, deviceId);
        if (token) {
            token.lastLogoutAt = new Date(); 
            token.isRevoked = true
            await token.save();
            return true;
        }
        else{
            throw new UnauthorizedException('You can not logout')
        }   
    }

    deleteByCustomer(customerId:number,transaction?:any)
    {
        return this.userTokenRepo.destroy({where:{customerId},transaction})
    }

    deleteByStore(storeId:number,transaction?:any)
    {
        return this.userTokenRepo.destroy({where:{storeId},transaction})
    }

    deleteByOnwer(ownerId:number,transaction?:any)
    {
        return this.userTokenRepo.destroy({where:{ownerId},transaction})
    }
}
