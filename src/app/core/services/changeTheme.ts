import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChangeThemeService {
  //dark theme and autotheme are considerd false by default
  private _darkTheme = signal(false);
  private _autoTheme = signal(false);

  isDarkTheme = computed(() => this._darkTheme());
  isAutoTheme = computed(() => this._autoTheme());

  constructor() {
    this.checkTime();
  }

  //function for setting the dark theme
  setDarkTheme(darkTheme: boolean): void {
    this._darkTheme.set(darkTheme);
    this._autoTheme.set(false);
    // set the theme if is dark is true, else set it to light
    localStorage.setItem('theme', darkTheme ? 'dark' : 'light');
    // remove the autotheme since it isn't activated
    localStorage.removeItem('autoTheme');
  }

  //function to toggle the auto theme
  // In your ChangeThemeService
  toggleAutoTheme(enable?: boolean): void {
    const newValue = enable !== undefined ? enable : !this._autoTheme();
    this._autoTheme.set(newValue);
    localStorage.setItem('autoTheme', newValue.toString());

    if (newValue) {
      this.checkTime();
    } else {
      const initialTheme = localStorage.getItem('theme') || 'light';
      this._darkTheme.set(initialTheme === 'dark');
    }
  }

  // function to check the time and change the theme
  private checkTime(): void {
    if (!this._autoTheme()) return;

    const time = new Date().getHours();
    const isNight = time >= 19 || time <= 6;
    this._darkTheme.set(isNight);

    if (isNight) {
      document.body.classList.add('zen-dark-theme');
    } else {
      document.body.classList.remove('zen-dark-theme');
    }
  }

  // initialize the theme
  initTheme(): void {
    const autoTheme = localStorage.getItem('autoTheme') === 'true';
    const initialTheme = localStorage.getItem('theme');

    if (autoTheme) {
      this._autoTheme.set(true);
      this.checkTime();
    } else {
      this._darkTheme.set(initialTheme === 'dark');
      document.body.classList.toggle('zen-dark-theme', initialTheme === 'dark');
    }
  }
}
