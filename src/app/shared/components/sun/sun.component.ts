import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { fromEvent, Subscription, animationFrameScheduler } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as SunCalc from 'suncalc';
import { format, isAfter, isBefore } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-sun-path',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sun.component.html',
  styleUrls: ['./sun.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunComponent implements OnInit, OnDestroy {
  sunPosition = { x: 0, y: 0 };
  targetPosition = { x: 0, y: 0 };
  isDay = false;
  currentTime = new Date();
  sunriseTime: Date = new Date();
  sunsetTime: Date = new Date();
  timezone = 'UTC';
  timeOfDay: 'night' | 'sunrise' | 'day' | 'sunset' = 'day';

  private sunSize = 160;
  private lastPositionUpdate = 0;
  private isBrowser: boolean;

  private resizeSubscription!: Subscription;
  private animationSubscription!: Subscription;
  private geolocationWatchId?: number;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.timeOfDay = 'day';
    this.setInitialPosition();
    this.getLocation();
    this.handleResize();
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    this.resizeSubscription?.unsubscribe();
    this.animationSubscription?.unsubscribe();

    if (this.geolocationWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.geolocationWatchId);
    }
  }

  private setInitialPosition(): void {
    this.sunPosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight,
    };
    this.targetPosition = { ...this.sunPosition };
  }

  private getLocation(): void {
    if (!navigator.geolocation) {
      this.calculateSunTimes(-36.8485, 174.7633); // Auckland fallback
      return;
    }

    this.geolocationWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        this.zone.run(() => {
          this.calculateSunTimes(pos.coords.latitude, pos.coords.longitude);
        });
      },
      () => this.calculateSunTimes(-36.8485, 174.7633),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  }

  private calculateSunTimes(lat: number, lng: number): void {
    const now = new Date();
    const times = SunCalc.getTimes(now, lat, lng);

    try {
      this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      this.timezone = 'UTC';
    }

    this.sunriseTime = toZonedTime(times.sunrise, this.timezone);
    this.sunsetTime = toZonedTime(times.sunset, this.timezone);

    this.updateTimeOfDay();
    this.updateSunPosition(true);
  }

  private updateTimeOfDay(): void {
    const now = new Date();
    const buffer = 15 * 60 * 1000;

    const isDaytime =
      isAfter(now, this.sunriseTime) && isBefore(now, this.sunsetTime);

    const isInSunrise =
      now.getTime() >= this.sunriseTime.getTime() - buffer &&
      now.getTime() <= this.sunriseTime.getTime() + buffer;

    const isInSunset =
      now.getTime() >= this.sunsetTime.getTime() - buffer &&
      now.getTime() <= this.sunsetTime.getTime() + buffer;

    if (!isDaytime) {
      this.timeOfDay = 'night';
    } else if (isInSunrise) {
      this.timeOfDay = 'sunrise';
    } else if (isInSunset) {
      this.timeOfDay = 'sunset';
    } else {
      this.timeOfDay = 'day';
    }

    this.cd.detectChanges();
  }

  private handleResize(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(throttleTime(300))
      .subscribe(() => {
        this.updateSunPosition(true);
        this.cd.markForCheck();
      });
  }

  private startAnimationLoop(): void {
    this.animationSubscription = animationFrameScheduler.schedule(() => {
      const now = Date.now();

      if (now - this.lastPositionUpdate > 60000) {
        this.currentTime = new Date();
        this.updateTimeOfDay();
        this.updateSunPosition();
        this.lastPositionUpdate = now;
      }

      this.animateSun();
      this.animationSubscription = animationFrameScheduler.schedule(() =>
        this.startAnimationLoop()
      );
    });
  }

  private animateSun(): void {
    const easing = 0.08;
    const dx = this.targetPosition.x - this.sunPosition.x;
    const dy = this.targetPosition.y - this.sunPosition.y;

    this.sunPosition.x += dx * easing;
    this.sunPosition.y += dy * easing;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this.cd.markForCheck();
    }
  }

  private updateSunPosition(force = false): void {
    const now = new Date();
    this.currentTime = now;

    const container = document.querySelector('.sun-container') as HTMLElement;
    if (!container) return;

    if (!isAfter(now, this.sunriseTime) || !isBefore(now, this.sunsetTime)) {
      this.targetPosition = {
        x: -this.sunSize,
        y: container.clientHeight + this.sunSize,
      };
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const totalDayTime = this.sunsetTime.getTime() - this.sunriseTime.getTime();
    const elapsedTime = now.getTime() - this.sunriseTime.getTime();
    const progress = Math.min(Math.max(elapsedTime / totalDayTime, 0), 1);

    const x = width * progress;
    const y = height - Math.sin(Math.PI * progress) * (height * 0.7);

    this.targetPosition = { x, y };
  }

  get sunStyle() {
    return {
      transform: `translate(${this.sunPosition.x - this.sunSize / 2}px, ${
        this.sunPosition.y - this.sunSize / 2
      }px)`,
      width: `${this.sunSize}px`,
      height: `${this.sunSize}px`,
      opacity: this.timeOfDay === 'night' ? 0 : 1,
      transition: 'opacity 0.5s ease, transform 1s linear',
      'will-change': 'transform, opacity',
      position: 'absolute',
    };
  }

  get timeDisplay() {
    return {
      current: format(this.currentTime, 'HH:mm'),
      sunrise: format(this.sunriseTime, 'HH:mm'),
      sunset: format(this.sunsetTime, 'HH:mm'),
      timezone: this.timezone,
    };
  }
}
