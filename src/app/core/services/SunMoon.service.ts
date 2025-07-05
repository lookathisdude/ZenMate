import { Injectable } from '@angular/core';
import * as SunCalc from 'suncalc';
import { toZonedTime } from 'date-fns-tz';
@Injectable({ providedIn: 'root' })
export class SunMoonService {
  //It could either be timezone or UTC
  private timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  //Check if its night
  isNight(lat: number, lng: number, currentTime = new Date()): boolean {
    const sunTimes = SunCalc.getTimes(currentTime, lat, lng);
    const sunrise = toZonedTime(sunTimes.sunrise, this.timeZone);
    const sunset = toZonedTime(sunTimes.sunset, this.timeZone);

    if (sunrise && sunset) {
      if (sunrise > sunset) {
        // Special case: sun sets after midnight
        return currentTime < sunrise && currentTime > sunset;
      }
      return currentTime < sunrise || currentTime > sunset;
    }

    return true;
  }
}
