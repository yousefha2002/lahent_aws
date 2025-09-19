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
