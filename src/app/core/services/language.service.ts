import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'selected_language';
  private readonly DEFAULT_LANG = 'en';
  private readonly AVAILABLE_LANGS = ['en', 'mr'];

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  /**
   * Initialize language from localStorage or default
   */
  private initializeLanguage(): void {
    this.translate.addLangs(this.AVAILABLE_LANGS);
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const savedLang = this.getSavedLanguage();
    const langToUse = this.AVAILABLE_LANGS.includes(savedLang) ? savedLang : this.DEFAULT_LANG;
    this.translate.use(langToUse);
  }

  /**
   * Get saved language from localStorage
   */
  private getSavedLanguage(): string {
    return localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
  }

  /**
   * Switch to a specific language
   */
  switchLanguage(lang: string): void {
    if (this.AVAILABLE_LANGS.includes(lang)) {
      this.translate.use(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANG;
  }

  /**
   * Toggle between available languages
   */
  toggleLanguage(): void {
    const currentLang = this.getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'mr' : 'en';
    this.switchLanguage(newLang);
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): string[] {
    return this.AVAILABLE_LANGS;
  }
}
