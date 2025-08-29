import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import i18next from 'i18next';

@Directive({
  selector: '[appTranslate]',
  standalone: true,
})
export class TranslateDirective implements OnInit, OnDestroy {
  @Input('appTranslate') key: string = '';
  @Input() translateParams: any = {};

  constructor(private el: ElementRef, private i18nService: I18nService) {}

  ngOnInit() {
    this.updateTranslation();

    // Listen for language changes
    i18next.on('languageChanged', () => {
      this.updateTranslation();
    });
  }

  ngOnDestroy() {
    i18next.off('languageChanged');
  }

  private updateTranslation() {
    if (this.key) {
      const translatedText = this.i18nService.translate(
        this.key,
        this.translateParams
      );
      this.el.nativeElement.textContent = translatedText;
    }
  }
}
