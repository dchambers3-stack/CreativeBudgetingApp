import { Injectable } from '@angular/core';
import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private isInitialized = false;

  async initializeI18n(): Promise<void> {
    try {
      await i18next
        .use(Backend)
        .use(LanguageDetector)
        .init({
          debug: true,
          fallbackLng: 'en',
          supportedLngs: ['en', 'es', 'fr'],
          detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
          },
          interpolation: {
            escapeValue: false,
          },
          backend: {
            loadPath: '/assets/i18n/{{lng}}.json',
          },
        });

      this.isInitialized = true;
      console.log('i18n initialized successfully');
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      this.isInitialized = false;
    }
  }

  translate(key: string, params?: any): string {
    if (!this.isInitialized) {
      console.warn('i18n not initialized, returning key:', key);
      return key;
    }
    return i18next.t(key, params) as string;
  }

  changeLanguage(language: string): Promise<void> {
    return new Promise((resolve) => {
      i18next.changeLanguage(language, () => {
        resolve();
      });
    });
  }

  getCurrentLanguage(): string {
    return i18next.language || 'en';
  }

  getSupportedLanguages(): string[] {
    return ['en', 'es', 'fr'];
  }

  getAvailableLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
    ];
  }

  getLanguageDisplayName(langCode: string): string {
    const languages: { [key: string]: string } = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
    };
    return languages[langCode] || langCode;
  }
}
