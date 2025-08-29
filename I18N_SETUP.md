# i18next Internationalization Setup

This document explains how to use the i18next internationalization (i18n) system implemented in your Creative Budgeting App.

## Overview

The app now supports multiple languages with the following features:

- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français
- Automatic language detection
- Language switching
- Persistent language selection

## Files Added

### Services

- `src/app/services/i18n.service.ts` - Main i18n service
- Configuration in `src/app/app.config.ts` - App initialization

### Components & Pipes

- `src/app/pipes/translate.pipe.ts` - Translation pipe for templates
- `src/app/components/language-selector.component.ts` - Language switcher
- `src/app/directives/translate.directive.ts` - Translation directive

### Translation Files

- `src/assets/i18n/en.json` - English translations
- `src/assets/i18n/es.json` - Spanish translations
- `src/assets/i18n/fr.json` - French translations

## How to Use Translations

### 1. In Templates (Recommended)

Use the `translate` pipe:

```html
<h1>{{ 'auth.login.title' | translate }}</h1>
<button>{{ 'common.save' | translate }}</button>
<input [placeholder]="'auth.login.username' | translate" />
```

### 2. In Components

Inject the I18nService:

```typescript
import { I18nService } from "../services/i18n.service";

export class MyComponent {
  private i18nService = inject(I18nService);

  someMethod() {
    const message = this.i18nService.translate("common.success");
    this.errorMessage.set(this.i18nService.translate("auth.login.error"));
  }
}
```

### 3. Using the Directive

For simple text elements:

```html
<span appTranslate="common.loading"></span>
<p appTranslate="dashboard.title"></p>
```

### 4. Language Selector

Add the language selector to any component:

```html
<app-language-selector></app-language-selector>
```

## Translation Key Structure

The translations are organized hierarchically:

```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "username": "Username",
      "password": "Password"
    }
  },
  "navigation": {
    "dashboard": "Dashboard",
    "addExpenses": "Add Expenses"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## Key Categories

- **auth** - Authentication (login, register)
- **navigation** - Menu and navigation items
- **dashboard** - Dashboard specific content
- **expenses** - Expense management
- **paychecks** - Paycheck management
- **helpdesk** - Support tickets
- **common** - Shared UI elements
- **categories** - Expense categories
- **status** - Status values
- **priority** - Priority levels

## Adding New Translations

1. **Add to all language files**: Update `en.json`, `es.json`, and `fr.json`
2. **Use descriptive keys**: `auth.login.title` not just `title`
3. **Group related keys**: Keep similar functionality together

Example:

```json
// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature",
    "button": "Try Now"
  }
}

// es.json
{
  "newFeature": {
    "title": "Nueva Característica",
    "description": "Esta es una nueva característica",
    "button": "Probar Ahora"
  }
}
```

## Language Detection

The system automatically detects language in this order:

1. **localStorage** - Previously selected language
2. **Browser language** - User's browser language
3. **Fallback** - English (en)

## Updating Components

To add translations to existing components:

1. **Import required modules**:

```typescript
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageSelectorComponent } from '../components/language-selector.component';

@Component({
  imports: [TranslatePipe, LanguageSelectorComponent, /* other imports */]
})
```

2. **Update template**:

```html
<!-- Before -->
<h1>Dashboard</h1>

<!-- After -->
<h1>{{ 'dashboard.title' | translate }}</h1>
```

3. **Update component logic**:

```typescript
// Before
this.errorMessage.set("Invalid input");

// After
this.errorMessage.set(this.i18nService.translate("common.error"));
```

## Performance Considerations

- **Lazy Loading**: Translation files are loaded only when needed
- **Caching**: Translations are cached in browser localStorage
- **Pure Pipes**: Translation pipe is optimized for performance
- **Change Detection**: Components automatically update when language changes

## Best Practices

1. **Use descriptive keys**: `auth.login.title` vs `title`
2. **Group logically**: Keep related translations together
3. **Consistent naming**: Use camelCase for keys
4. **Avoid hardcoded text**: Always use translation keys
5. **Test all languages**: Verify translations in all supported languages

## Example Implementation

See `src/app/login/login.component.ts` and `login.component.html` for a complete example of:

- Component setup with i18n
- Template usage with translate pipe
- Language selector integration
- Error message translation

## Adding New Languages

1. Create new translation file: `src/assets/i18n/[language-code].json`
2. Add language to `I18nService.getAvailableLanguages()`
3. Add display name to `I18nService.getLanguageDisplayName()`
4. Update supported languages in `i18nService.initializeI18n()`

## Troubleshooting

- **Missing translations**: Check browser console for missing key warnings
- **Language not switching**: Verify translation files are in `/assets/i18n/`
- **Build errors**: Ensure all imports are correct in components
- **Template errors**: Check translation key spelling

The i18n system is now ready for use across your entire application!
