import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeSwitcherComponent } from './shared/components/theme/theme-switcher.component';
import { SunComponent } from './shared/components/sun/sun.component';
import { MoonComponent } from './shared/components/moon/moon.component';
import { CommonModule } from '@angular/common';
import { TimeDisplayComponent } from "./shared/components/time-display/time-display.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ThemeSwitcherComponent,
    SunComponent,
    MoonComponent,
    CommonModule,
    TimeDisplayComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ZenMateFrontend';

  showSun = true;
  showMoon = true;

  onSunDone(isDone: boolean) {
    this.showSun = !isDone;
  }

  onMoonDone(isDone: boolean) {
    this.showMoon = !isDone;
  }
}
