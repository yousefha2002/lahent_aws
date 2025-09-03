import { Expose, Transform, Type } from 'class-transformer';
import { StoreLanguageDto } from './store-language.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleStoreDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ type: [StoreLanguageDto] })
    @Expose()
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];

    @ApiProperty({ example: 'Riyadh' })
    @Expose()
    city: string;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @Expose()
    logoUrl: string;

    @ApiProperty({ example: 'https://example.com/cover.png' })
    @Expose()
    coverUrl: string;

    @ApiProperty({ example: '+966501234567' })
    @Expose()
    phone: string;

    @ApiProperty({ example: 24.7136 })
    @Expose()
    lng: number;

    @ApiProperty({ example: 46.6753 })
    @Expose()
    lat: number;

    @ApiProperty({ example: '08:00', nullable: true })
    @Expose()
    openTime: string | null;

    @ApiProperty({ example: '18:00', nullable: true })
    @Expose()
    closeTime: string | null;

    @ApiProperty({ example: 4.5 })
    @Expose()
    @Transform(({ obj }) => obj.numberOfRates > 0 ? obj.rate / obj.numberOfRates : 0)
    averageRating: number;

    @ApiProperty({ example: 10 })
    @Expose()
    numberOfRates: number;
}

export class StoreWithTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @Expose()
    accessToken: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @Expose()
    refreshToken: string;

    @ApiProperty({ type: SimpleStoreDto })
    @Expose()
    @Type(() => SimpleStoreDto)
    store: SimpleStoreDto;
}