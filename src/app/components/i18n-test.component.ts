import { Component, inject, OnInit } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-i18n-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; border: 2px solid #ccc; margin: 20px;">
      <h3>i18n Test Component</h3>
      <p><strong>Direct service call:</strong> {{ directTranslation }}</p>
      <p><strong>Service initialized:</strong> {{ isServiceInitialized }}</p>
      <p><strong>Current language:</strong> {{ currentLanguage }}</p>
      <hr />
      <button (click)="testTranslation()">Test Translation</button>
      <button (click)="changeToSpanish()">Change to Spanish</button>
      <button (click)="changeToEnglish()">Change to English</button>
    </div>
  `,
})
export class I18nTestComponent implements OnInit {
  private i18nService = inject(I18nService);

  directTranslation = '';
  isServiceInitialized = 'Checking...';
  currentLanguage = '';

  ngOnInit() {
    this.testTranslation();
    this.currentLanguage = this.i18nService.getCurrentLanguage();
  }

  testTranslation() {
    this.directTranslation = this.i18nService.translate('auth.login.title');
    this.currentLanguage = this.i18nService.getCurrentLanguage();
    console.log('Test translation result:', this.directTranslation);
  }

  changeToSpanish() {
    this.i18nService.changeLanguage('es').then(() => {
      this.testTranslation();
    });
  }

  changeToEnglish() {
    this.i18nService.changeLanguage('en').then(() => {
      this.testTranslation();
    });
  }
}
