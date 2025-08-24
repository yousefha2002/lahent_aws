import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Language } from 'src/common/enums/language';

@ValidatorConstraint({ name: 'ValidLanguageKeysAndValues', async: false })
export class ValidLanguageKeysAndValues
  implements ValidatorConstraintInterface
{
  validate(names: Record<string, any>, args: ValidationArguments) {
    if (!names || typeof names !== 'object') return false;

    const keys = Object.keys(names).sort();
    // Ensure only 'en' and 'ar' exist
    if (
      keys.length !== 2 ||
      !keys.includes(Language.en) ||
      !keys.includes(Language.ar)
    )
      return false;

    // Validate each value
    return keys.every(
      (key) =>
        typeof names[key] === 'string' &&
        names[key].trim().length >= 3 &&
        names[key].trim().length <= 14,
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `Names object must contain exactly 'en' and 'ar' keys with string values of 3-14 characters`;
  }
}
