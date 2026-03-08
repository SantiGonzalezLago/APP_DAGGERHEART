export type LocalizedTextField = Record<string, string> | string;

export function getLocalizedText(field: LocalizedTextField, locale: string): string {
  if (typeof field === 'string') {
    return field;
  }

  return field[locale] || field['en'] || '';
}