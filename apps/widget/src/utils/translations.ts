import {
  WIDGET_TRANSLATION_DEFAULTS,
  interpolateTranslation,
  type WidgetTranslations,
} from '@convia/shared-types';

export function t(
  translations: WidgetTranslations | undefined,
  key: keyof WidgetTranslations,
  vars?: Record<string, string | number>,
): string {
  const text = translations?.[key] || WIDGET_TRANSLATION_DEFAULTS[key];
  return interpolateTranslation(text, vars);
}
