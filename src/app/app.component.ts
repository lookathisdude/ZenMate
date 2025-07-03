import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeSwitcherComponent } from './shared/components/theme/theme-switcher.component';
import { SunComponent } from './shared/components/sun/sun.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeSwitcherComponent, SunComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ZenMateFrontend';
}
