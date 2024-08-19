export function GetI18nText(i18nText?: { [k: string]: string }, language?: string) {
  if (!i18nText) return '';
  if (language && i18nText[language]) {
    return i18nText[language];
  } else {
    const availableLanguages = Object.keys(i18nText);
    return i18nText[availableLanguages[0]];
  }
}
