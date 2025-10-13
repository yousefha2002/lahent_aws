import {BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { UserToken } from './entities/user_token.entity';
import { CreateTokenDto } from './dtos/createToken.dto';
import { Op } from 'sequelize';
import { RoleStatus } from 'src/common/enums/role_status';
import { RefreshTokenDto } from './dtos/refreshToken.dto';
import { REFRESH_TOKEN_EXPIRES_MS } from 'src/common/constants';
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
        adminId: dto.adminId || null,
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


    async findExistingToken(type: RoleStatus, entityId: number, deviceId: string) {
        const where: any = { deviceId, role: type,expiresAt: { [Op.gt]: new Date() },isRevoked:false };

        switch (type) {
            case RoleStatus.OWNER:
            where.ownerId = entityId;
            break;
            case RoleStatus.CUSTOMER:
            where.customerId = entityId;
            break;
            case RoleStatus.ADMIN:
            where.adminId = entityId;
            break;
            default:
            throw new BadRequestException('Invalid role type');
        }

        return this.userTokenRepo.findOne({ where });
    }

    async rotateToken(token: UserToken,newRefreshToken: string,expiresAt: Date,) 
    {
        token.refreshToken = newRefreshToken;
        token.expiresAt = expiresAt;
        await token.save();
        return token;
    }

    async logout(body:RefreshTokenDto) 
    {
        const token = await this.findTokenForRefreshing(body.refreshToken,body.deviceId);
        if (!token) {
            throw new UnauthorizedException('Invalid or already revoked token');
        }

        token.isRevoked = true;
        token.lastLogoutAt = new Date();
        await token.save();

        return { message: 'Logged out successfully' };
    }

    async handleUserToken(type: RoleStatus,entityId: number,refreshToken: string,deviceId: string,device?: string,ip?: string) 
    {
        const existingToken = await this.findExistingToken(type, entityId, deviceId);

        if (existingToken) 
        {
            await this.rotateToken(existingToken,refreshToken,new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS));
            existingToken.lastLoginAt = new Date();
            await existingToken.save();
        } 
        else 
            {
            let idField: 'ownerId' | 'customerId' | 'adminId';
            switch (type) {
                case RoleStatus.OWNER:
                    idField = 'ownerId';
                    break;
                case RoleStatus.CUSTOMER:
                    idField = 'customerId';
                    break;
                case RoleStatus.ADMIN:
                    idField = 'adminId';
                    break;
                default:
                    throw new BadRequestException('Invalid role type');
            }
            await this.createToken({[idField]: entityId,role: type,refreshToken,expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),device,deviceId,ip,});
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
