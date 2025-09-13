import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PageContentDto {
  @Expose()
  @ApiProperty({ example: 'en', description: 'Language code of the content' })
  languageCode: string;

  @Expose()
  @ApiProperty({ example: '<p>Privacy policy content</p>', description: 'Content of the page in specific language' })
  content: string;
}

export class PageDto {
  @Expose()
  @ApiProperty({ example: 1, description: 'ID of the page' })
  id: number;

  @Expose()
  @ApiProperty({ example: 'PRIVACY_POLICY', description: 'Type of the page' })
  type: string;

  @Expose()
  @Type(() => PageContentDto)
  @ApiProperty({ type: [PageContentDto], description: 'Contents of the page in different languages' })
  languages: PageContentDto[];
}