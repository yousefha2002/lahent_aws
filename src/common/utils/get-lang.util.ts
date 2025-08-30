import { I18nContext } from 'nestjs-i18n';
import { Language } from '../enums/language';

export function getLang(i18n: I18nContext): Language {
    const lang = i18n.lang?.split(/[-,]/)[0] ?? 'ar'; // افتراضية عربي
    return (lang === 'en' ? Language.en : Language.ar);
}