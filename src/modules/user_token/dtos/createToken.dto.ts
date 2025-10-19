export interface CreateTokenDto {
    customerId?: number;
    storeId?: number;
    ownerId?: number;
    adminId?: number;
    role: string;
    refreshToken: string;
    expiresAt: Date;
    deviceId:string
}