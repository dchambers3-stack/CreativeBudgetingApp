import {
  ApplicationConfig,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { I18nService } from './services/i18n.service';

export function initializeI18n(i18nService: I18nService) {
  return () => {
    console.log('Starting i18n initialization...');
    return i18nService
      .initializeI18n()
      .then(() => {
        console.log('i18n initialization completed');
      })
      .catch((err) => {
        console.error('i18n initialization failed:', err);
      });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeI18n,
      deps: [I18nService],
      multi: true,
    },
  ],
};
