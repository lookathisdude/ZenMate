import { Component, effect, inject, signal } from '@angular/core';
import { ChangeThemeService } from '../../../core/services/changeTheme';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'zen-theme-switcher',
  standalone: true,
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  imports: [MatIconModule],
  animations: [
    trigger('ballAnimation', [
      transition('* => *', [
        style({ transform: 'scale(0.95)' }),
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'scale(1)' })
        ),
      ]),
    ]),
  ],
})
export class ThemeSwitcherComponent {
  protected readonly changeThemeService = inject(ChangeThemeService);

  protected position = signal<'left' | 'center' | 'right'>('center');
  protected activeTheme = signal<'light' | 'dark' | 'auto'>('dark');
  protected animationTrigger = signal(0);

  constructor() {
    this.initializeTheme();

    effect(() => {
      const isAuto = this.changeThemeService.isAutoTheme();
      const isDark = this.changeThemeService.isDarkTheme();

      if (isAuto) {
        this.position.set('right');
        this.activeTheme.set('auto');
      } else {
        this.position.set(isDark ? 'center' : 'left');
        this.activeTheme.set(isDark ? 'dark' : 'light');
      }
      this.animationTrigger.update((v) => v + 1); // Trigger animation on change
    });
  }

  private initializeTheme() {
    if (this.changeThemeService.isAutoTheme()) {
      this.position.set('right');
      this.activeTheme.set('auto');
    } else {
      this.position.set(
        this.changeThemeService.isDarkTheme() ? 'center' : 'left'
      );
      this.activeTheme.set(
        this.changeThemeService.isDarkTheme() ? 'dark' : 'light'
      );
    }
  }

  protected setTheme(theme: 'light' | 'dark' | 'auto') {
    switch (theme) {
      case 'light':
        this.changeThemeService.setDarkTheme(false);
        if (this.changeThemeService.isAutoTheme()) {
          this.changeThemeService.toggleAutoTheme(false);
        }
        break;
      case 'dark':
        this.changeThemeService.setDarkTheme(true);
        if (this.changeThemeService.isAutoTheme()) {
          this.changeThemeService.toggleAutoTheme(false);
        }
        break;
      case 'auto':
        if (!this.changeThemeService.isAutoTheme()) {
          this.changeThemeService.toggleAutoTheme(true);
        }
        break;
    }
  }

  protected cycleTheme() {
    if (this.activeTheme() === 'auto') {
      this.setTheme('light');
    } else if (this.activeTheme() === 'dark') {
      this.setTheme('auto');
    } else {
      this.setTheme('dark');
    }
  }
}
