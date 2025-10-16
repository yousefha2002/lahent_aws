import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Language } from 'src/common/enums/language';

export class CreateTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: JSON.stringify([
      { languageCode: 'en', name: 'Store' },
      { languageCode: 'ar', name: 'متجر' },
    ]),
  })
  languages: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: any;
}