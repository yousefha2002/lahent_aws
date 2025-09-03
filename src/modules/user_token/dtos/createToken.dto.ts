export interface CreateTokenDto {
    customerId?: number;
    storeId?: number;
    ownerId?: number;
    role: string;
    refreshToken: string;
    expiresAt: Date;
    device?: string;
    ip?: string;
}