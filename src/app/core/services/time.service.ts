import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { timer } from 'rxjs';

export interface Time {
  currentTime: Date;
  sunriseTime?: Date | null;
  sunsetTime?: Date | null;
  moonriseTime?: Date | null;
  moonsetTime?: Date | null;
  timeZone: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimeService {
  private timeData = new BehaviorSubject<Time>({
    currentTime: new Date(),
    timeZone: 'UTC',
  });

  time$ = this.timeData.asObservable();

  constructor() {
    this.startTimer();
  }

  private startTimer() {
    const currentTime = new Date();
    const msUntilNextMinute =
      (60 - currentTime.getSeconds()) * 1000 - currentTime.getMilliseconds();

    setTimeout(() => {
      this.updateCurrentTime();

      timer(60000, 60000).subscribe(() => {
        this.updateCurrentTime();
      });
    }, msUntilNextMinute);
  }

  private updateCurrentTime() {
    this.timeData.next({
      ...this.timeData.value,
      currentTime: new Date(),
    });
  }

  setTimeData(data: Time): void {
    this.timeData.next(data);
  }

  updatePartialData(partial: Partial<Time>) {
    this.timeData.next({ ...this.timeData.value, ...partial });
  }

  getTimeData(): Time {
    return this.timeData.value;
  }
}
