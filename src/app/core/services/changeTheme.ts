import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChangeThemeService {
  private _darkTheme = signal(false);
  private _autoTheme = signal(false);

  isDarkTheme = computed(() => this._darkTheme());
  isAutoTheme = computed(() => this._autoTheme());

  constructor() {
    this.initTheme();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.document;
  }

  setDarkTheme(darkTheme: boolean): void {
    this._darkTheme.set(darkTheme);
    this._autoTheme.set(false);
    if (this.isBrowser()) {
      localStorage.setItem('theme', darkTheme ? 'dark' : 'light');
      localStorage.removeItem('autoTheme');
    }
    this.updateBodyClass(darkTheme);
  }

  toggleAutoTheme(enable?: boolean): void {
    const newValue = enable !== undefined ? enable : !this._autoTheme();
    this._autoTheme.set(newValue);
    if (this.isBrowser()) {
      localStorage.setItem('autoTheme', newValue.toString());
    }

    if (newValue) {
      this.checkTime();
    } else {
      const initialTheme = this.isBrowser()
        ? localStorage.getItem('theme') || 'light'
        : 'light';
      const isDark = initialTheme === 'dark';
      this._darkTheme.set(isDark);
      this.updateBodyClass(isDark);
    }
  }

  private checkTime(): void {
    if (!this._autoTheme()) return;

    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour <= 6;
    this._darkTheme.set(isNight);
    this.updateBodyClass(isNight);
  }

  private updateBodyClass(isDark: boolean): void {
    if (!this.isBrowser()) return;

    const body = document.body;
    if (isDark) {
      body.classList.add('zen-dark-theme');
      body.classList.remove('zen-light-theme');
    } else {
      body.classList.add('zen-light-theme');
      body.classList.remove('zen-dark-theme');
    }
  }

  initTheme(): void {
    if (!this.isBrowser()) return;

    const autoTheme = localStorage.getItem('autoTheme') === 'true';
    const initialTheme = localStorage.getItem('theme') || 'light';

    this._autoTheme.set(autoTheme);

    if (autoTheme) {
      this.checkTime();
    } else {
      const isDark = initialTheme === 'dark';
      this._darkTheme.set(isDark);
      this.updateBodyClass(isDark);
    }
  }
}
