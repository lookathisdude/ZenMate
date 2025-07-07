import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, isValid } from 'date-fns';
import { Observable, Subscription } from 'rxjs';
import { Time, TimeService } from '../../../core/services/time.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-time-display',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './time-display.component.html',
  styleUrls: ['./time-display.component.scss'],
  animations: [
    trigger('flip', [
      state('static', style({ transform: 'rotateX(0deg)' })),
      state('flipped', style({ transform: 'rotateX(180deg)' })),
      transition('static => flipped', [animate('400ms ease-out')]),
      transition('flipped => static', [animate('400ms ease-in')]),
    ]),
  ],
})
export class TimeDisplayComponent implements OnInit {
  timeDisplayData$: Observable<Time>;
  flipState: 'static' | 'flipped' = 'static';
  private lastTime = '';
  private subscription: Subscription | undefined;

  constructor(
    private timeService: TimeService,
    private cdr: ChangeDetectorRef
  ) {
    this.timeDisplayData$ = this.timeService.time$;
  }

  ngOnInit() {
    this.subscription = this.timeDisplayData$.subscribe((time) => {
      const formatted = this.formatTime(time?.currentTime);
      if (formatted !== this.lastTime) {
        this.lastTime = formatted;
        this.flipState = 'flipped';
        this.cdr.detectChanges();

        // Reset flipState back to static after animation to allow next flip
        setTimeout(() => {
          this.flipState = 'static';
          this.cdr.detectChanges();
        }, 400);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  formatTime(date?: Date | null): string {
    if (!date || !isValid(date)) {
      return 'N/A';
    }
    return format(date, 'HH:mm');
  }
}
