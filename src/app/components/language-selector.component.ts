import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-selector">
      <select
        [value]="currentLanguage"
        (change)="onLanguageChange($event)"
        class="language-select"
      >
        <option *ngFor="let lang of availableLanguages" [value]="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>
  `,
  styles: [
    `
      .language-selector {
        display: inline-block;
      }

      .language-select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
      }

      .language-select:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    `,
  ],
})
export class LanguageSelectorComponent {
  private i18nService = inject(I18nService);

  currentLanguage = this.i18nService.getCurrentLanguage();
  availableLanguages = this.i18nService.getAvailableLanguages();

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedLanguage = target.value;

    this.i18nService.changeLanguage(selectedLanguage).then(() => {
      this.currentLanguage = selectedLanguage;
    });
  }

  getLanguageDisplayName(lang: string): string {
    return this.i18nService.getLanguageDisplayName(lang);
  }
}
