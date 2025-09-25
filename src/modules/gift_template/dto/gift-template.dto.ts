import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class BasicGiftTemplateDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: string;

  @ApiProperty({ example: 'https:/cloudinary/image.com' })
  @Expose()
  imageUrl: string;
}

export class AdminGiftTemplateDto extends BasicGiftTemplateDto {
  @ApiProperty({ example: '2025-09-24T12:00:00Z' })
  @Expose()
  startDate: Date;

  @ApiProperty({ example: '2025-12-31T12:00:00Z' })
  @Expose()
  endDate: Date | null;
}

export class PaginatedGiftTemplateDto {
  @ApiProperty({ example: 30 })
  @Expose()
  total: number;

  @ApiProperty({ example: 3 })
  @Expose()
  totalPages: number;

  @ApiProperty({ type: [BasicGiftTemplateDto] })
  @Expose()
  @Type(() => BasicGiftTemplateDto)
  data: BasicGiftTemplateDto[];
}


export class PaginatedAdminGiftTemplateDto extends PaginatedGiftTemplateDto {
  @ApiProperty({ type: [AdminGiftTemplateDto] })
  @Expose()
  @Type(() => AdminGiftTemplateDto)
  data: AdminGiftTemplateDto[];
}