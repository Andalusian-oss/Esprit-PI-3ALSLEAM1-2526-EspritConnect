import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lang, Translations, TRANSLATIONS } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private _lang$: BehaviorSubject<Lang>;

  constructor() {
    const saved = (typeof localStorage !== 'undefined'
      ? localStorage.getItem('app-lang')
      : null) as Lang | null;
    this._lang$ = new BehaviorSubject<Lang>(saved === 'en' ? 'en' : 'fr');
  }

  get current(): Lang { return this._lang$.value; }

  toggle(): void {
    const next: Lang = this._lang$.value === 'fr' ? 'en' : 'fr';
    this._lang$.next(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-lang', next);
    }
  }

  t(key: keyof Translations | string): string {
    return TRANSLATIONS[this._lang$.value][key as keyof Translations] ?? key;
  }
}
