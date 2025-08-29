import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../services/i18n.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../components/language-selector.component';

@Component({
  selector: 'app-i18n-demo',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageSelectorComponent],
  template: `
    <div class="demo-container">
      <h2>{{ 'common.demo' | translate }}</h2>

      <!-- Language Selector -->
      <div class="language-section">
        <h3>{{ 'common.selectLanguage' | translate }}</h3>
        <app-language-selector></app-language-selector>
      </div>

      <!-- Demo Translations -->
      <div class="translation-demos">
        <h3>{{ 'common.examples' | translate }}</h3>

        <div class="demo-item">
          <strong>{{ 'auth.login.title' | translate }}</strong>
          <p>
            {{ 'auth.login.username' | translate }}:
            <input [placeholder]="'auth.login.username' | translate" />
          </p>
        </div>

        <div class="demo-item">
          <strong>{{ 'navigation.dashboard' | translate }}</strong>
          <p>{{ 'dashboard.title' | translate }}</p>
        </div>

        <div class="demo-item">
          <strong>{{ 'common.actions' | translate }}</strong>
          <button>{{ 'common.save' | translate }}</button>
          <button>{{ 'common.cancel' | translate }}</button>
        </div>

        <div class="demo-item">
          <strong>{{ 'categories.title' | translate }}</strong>
          <ul>
            <li>{{ 'categories.housing' | translate }}</li>
            <li>{{ 'categories.food' | translate }}</li>
            <li>{{ 'categories.transportation' | translate }}</li>
          </ul>
        </div>
      </div>

      <!-- Language Info -->
      <div class="language-info">
        <p>
          <strong>{{ 'common.currentLanguage' | translate }}:</strong>
          {{ getCurrentLanguageDisplay() }}
        </p>
        <p>
          <strong>{{ 'common.availableLanguages' | translate }}:</strong>
          {{ getAvailableLanguagesList() }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
      }

      .language-section {
        margin: 2rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
      }

      .translation-demos {
        margin: 2rem 0;
      }

      .demo-item {
        margin: 1rem 0;
        padding: 1rem;
        border-left: 3px solid #007bff;
        background: #f8f9fa;
      }

      .demo-item button {
        margin-right: 0.5rem;
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
      }

      .demo-item button:hover {
        background: #e9ecef;
      }

      .demo-item input {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 200px;
      }

      .language-info {
        margin-top: 2rem;
        padding: 1rem;
        background: #e9ecef;
        border-radius: 4px;
      }
    `,
  ],
})
export class I18nDemoComponent {
  private i18nService = inject(I18nService);

  getCurrentLanguageDisplay(): string {
    const currentLang = this.i18nService.getCurrentLanguage();
    return this.i18nService.getLanguageDisplayName(currentLang);
  }

  getAvailableLanguagesList(): string {
    return this.i18nService
      .getAvailableLanguages()
      .map((lang) => this.i18nService.getLanguageDisplayName(lang))
      .join(', ');
  }
}
