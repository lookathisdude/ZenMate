import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { fromEvent, Subscription, animationFrameScheduler } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import * as SunCalc from 'suncalc';
import { format, isAfter, isBefore } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-moon-path',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moon.component.html',
  styleUrls: ['./moon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoonComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLElement>;

  moonPosition = { x: 0, y: 0 };
  targetPosition = { x: 0, y: 0 };
  moonSize = 80;
  moonPhase = 0; // 0 to 1
  moonIllumination = 0; // 0 to 1
  isVisible = false;

  currentTime = new Date();
  moonriseTime: Date | null = null;
  moonsetTime: Date | null = null;
  timezone = 'UTC';

  private resizeSubscription!: Subscription;
  private animationSubscription!: Subscription;
  private geolocationWatchId?: number;
  private lastPositionUpdate = 0;
  private isBrowser: boolean;

  moonImageUrl = '/assets/moon.png';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.initializeMoonPosition();
    this.isVisible = true;
    this.getLocation();
    this.setupResizeListener();
    this.startAnimationLoop();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
    this.clearGeolocationWatch();
  }

  private initializeMoonPosition(): void {
    this.moonPosition = {
      x: window.innerWidth * 0.2,
      y: 600 * 0.8,
    };
    this.targetPosition = { ...this.moonPosition };
  }

  private getLocation(): void {
    if (!this.isBrowser) {
      this.useDefaultLocation();
      return;
    }

    if (navigator.geolocation) {
      this.setupGeolocationWatch();
    } else {
      this.useDefaultLocation();
    }
  }

  private useDefaultLocation(): void {
    this.calculateMoonData(-36.8485, 174.7633);
    this.cd.markForCheck();
  }

  private setupGeolocationWatch(): void {
    this.geolocationWatchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePositionSuccess(pos),
      (err) => this.handlePositionError(err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  }

  private handlePositionSuccess(pos: GeolocationPosition): void {
    this.zone.run(() => {
      this.calculateMoonData(pos.coords.latitude, pos.coords.longitude);
      this.cd.markForCheck();
    });
  }

  private handlePositionError(err: GeolocationPositionError): void {
    console.warn('Geolocation error, using default:', err.message);
    this.useDefaultLocation();
  }

  private calculateMoonData(lat: number, lng: number): void {
    if (this.isBrowser) {
      try {
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        this.timezone = 'UTC';
      }
    }

    const currentTime = new Date();
    const moonData = SunCalc.getMoonIllumination(currentTime);
    this.moonPhase = moonData.phase;
    this.moonIllumination = moonData.fraction;

    const times = SunCalc.getMoonTimes(currentTime, lat, lng, true);

    if (times.rise && times.set) {
      this.moonriseTime = toZonedTime(times.rise, this.timezone);
      this.moonsetTime = toZonedTime(times.set, this.timezone);

      if (this.moonsetTime.getTime() < this.moonriseTime.getTime()) {
        this.moonsetTime = new Date(
          this.moonsetTime.getTime() + 24 * 60 * 60 * 1000
        );
      }
    } else {
      this.moonriseTime = new Date(currentTime.getTime() - 2 * 60 * 60 * 1000);
      this.moonsetTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
    }

    this.updateMoonPosition(true);
  }

  private setupResizeListener(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(throttleTime(300))
      .subscribe(() => {
        this.updateMoonPosition(true);
        this.cd.markForCheck();
      });
  }

  private startAnimationLoop(): void {
    this.animationSubscription = animationFrameScheduler.schedule(() => {
      const now = Date.now();
      if (now - this.lastPositionUpdate > 60000) {
        this.currentTime = new Date();
        this.updateMoonPosition();
        this.lastPositionUpdate = now;
      }
      this.animateMoon();
      this.animationSubscription = animationFrameScheduler.schedule(() =>
        this.startAnimationLoop()
      );
    });
  }

  private animateMoon(): void {
    const easing = 0.05;
    const dx = this.targetPosition.x - this.moonPosition.x;
    const dy = this.targetPosition.y - this.moonPosition.y;

    this.moonPosition.x += dx * easing;
    this.moonPosition.y += dy * easing;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this.cd.markForCheck();
    }
  }

  private updateMoonPosition(force = false): void {
    const now = new Date();
    this.currentTime = now;

    let visible = false;
    if (this.moonriseTime && this.moonsetTime) {
      if (this.moonriseTime > this.moonsetTime) {
        visible =
          isAfter(now, this.moonriseTime) || isBefore(now, this.moonsetTime);
      } else {
        visible =
          isAfter(now, this.moonriseTime) && isBefore(now, this.moonsetTime);
      }
    } else {
      visible = this.moonriseTime === null && this.moonsetTime === null;
    }

    if (visible !== this.isVisible || force) {
      this.isVisible = visible;
      this.cd.markForCheck();
    }

    const container = this.containerRef?.nativeElement;
    if (!container) return;

    if (!this.isVisible) {
      this.targetPosition = {
        x: -this.moonSize,
        y: container.clientHeight + this.moonSize,
      };
      return;
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (!this.moonriseTime || !this.moonsetTime) {
      this.targetPosition = {
        x: containerWidth / 2,
        y: containerHeight / 2,
      };
      return;
    }

    let totalVisibleTime =
      this.moonsetTime.getTime() - this.moonriseTime.getTime();
    let elapsedVisibleTime = now.getTime() - this.moonriseTime.getTime();

    if (totalVisibleTime < 0) totalVisibleTime += 24 * 60 * 60 * 1000;
    if (elapsedVisibleTime < 0) elapsedVisibleTime += 24 * 60 * 60 * 1000;

    const progress = Math.min(
      Math.max(elapsedVisibleTime / totalVisibleTime, 0),
      1
    );

    // DEBUG LOGS - remove/comment in production
    console.log('Now:', now.toLocaleTimeString());
    console.log('Moonrise:', this.moonriseTime?.toLocaleTimeString());
    console.log('Moonset:', this.moonsetTime?.toLocaleTimeString());
    console.log('Progress:', progress);
    console.log('Visible:', visible);

    const x = containerWidth * progress;
    const maxHeight = containerHeight * 0.5;
    const angle = Math.PI * progress;
    const y = containerHeight - Math.sin(angle) * maxHeight;

    this.targetPosition = { x, y };
  }

  get moonShadowStyle(): string {
    const phase = this.moonPhase;
    const illumination = this.moonIllumination;
    const isWaxing = phase < 0.5;

    const offsetX = isWaxing
      ? ((0.5 - phase) / 0.5) * 100
      : -((phase - 0.5) / 0.5) * 100;

    return `
      radial-gradient(
        ellipse 60% 100% at ${50 + offsetX}% 50%,
        rgba(255 255 255 / ${illumination}) 40%,
        rgba(0 0 0 / 0.6) 70%
      )
    `;
  }

  get moonImgStyle() {
    const minOpacity = 0.2;
    const opacity = this.isVisible
      ? Math.max(this.moonIllumination, minOpacity)
      : 0;

    return {
      transform: `translate(${this.moonPosition.x - this.moonSize / 2}px, ${
        this.moonPosition.y - this.moonSize / 2
      }px)`,
      width: `${this.moonSize}px`,
      height: `${this.moonSize}px`,
      opacity,
      transition: 'opacity 1s ease, transform 2s linear',
      'will-change': 'transform, opacity',
      position: 'absolute',
      'z-index': '-1',
      'pointer-events': 'none',
      'user-select': 'none',
      'background-image': this.moonShadowStyle,
      'background-repeat': 'no-repeat',
      'background-position': 'center',
      'background-size': '100% 100%',
      filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.6))',
      'border-radius': '50%',
      'box-shadow': '0 0 15px 5px rgba(255, 255, 255, 0.3)',
    };
  }

  get timeDisplay() {
    return {
      current: format(this.currentTime, 'HH:mm'),
      moonrise: this.moonriseTime
        ? format(this.moonriseTime, 'HH:mm')
        : 'No moonrise',
      moonset: this.moonsetTime
        ? format(this.moonsetTime, 'HH:mm')
        : 'No moonset',
      phase: this.getPhaseName(),
      illumination: `${Math.round(this.moonIllumination * 100)}%`,
      timezone: this.timezone,
    };
  }

  private getPhaseName(): string {
    const p = this.moonPhase;

    if (p < 0.02 || p > 0.98) return 'New Moon';
    else if (p < 0.125) return 'Waxing Crescent';
    else if (p < 0.25) return 'First Quarter';
    else if (p < 0.375) return 'Waxing Gibbous';
    else if (p < 0.5) return 'Full Moon';
    else if (p < 0.625) return 'Waning Gibbous';
    else if (p < 0.75) return 'Last Quarter';
    else if (p < 0.875) return 'Waning Crescent';
    else return 'New Moon';
  }

  private cleanupSubscriptions(): void {
    this.resizeSubscription?.unsubscribe();
    this.animationSubscription?.unsubscribe();
  }

  private clearGeolocationWatch(): void {
    if (this.isBrowser && this.geolocationWatchId !== undefined) {
      navigator.geolocation.clearWatch(this.geolocationWatchId);
    }
  }
}
