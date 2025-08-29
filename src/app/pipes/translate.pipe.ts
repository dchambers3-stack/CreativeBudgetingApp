import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { I18nService } from '../services/i18n.service';
import i18next from 'i18next';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey: string = '';
  private lastValue: string = '';

  constructor(private i18nService: I18nService, private cd: ChangeDetectorRef) {
    // Listen for language changes
    i18next.on('languageChanged', () => {
      this.cd.markForCheck();
    });
  }

  transform(key: string, options?: any): string {
    if (!key) return '';

    // Always call the service to get the latest translation
    const translatedValue = this.i18nService.translate(key, options);

    // Debug: log if translation is missing
    if (translatedValue === key) {
      console.warn(`Translation missing for key: ${key}`);
    }

    return translatedValue;
  }

  ngOnDestroy() {
    i18next.off('languageChanged');
  }
}
