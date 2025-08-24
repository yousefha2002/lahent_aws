import { IsNotEmpty, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { Language } from 'src/common/enums/language';
import { ValidLanguageKeysAndValues } from 'src/common/validation/valid-language-keys.validator';

export class UpdateCarBrandDto {
  @IsNotEmpty({ message: 'Names object cannot be empty' })
  @Validate(ValidLanguageKeysAndValues)
  @Transform(
    ({ value }) => {
      if (!value || typeof value !== 'object') return value;
      const result: Record<'en' | 'ar', string> = {} as any;
      for (const key of [Language.en, Language.ar]) {
        if (typeof value[key] === 'string') result[key] = value[key].trim();
      }
      return result;
    },
    { toClassOnly: true },
  )
  names: Record<'en' | 'ar', string>;
}
