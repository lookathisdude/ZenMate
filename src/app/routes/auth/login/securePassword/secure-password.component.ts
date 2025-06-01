import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-secure-pasword',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './secure-password.component.html',
  styleUrls: ['./secure-password.component.scss'],
})
export class PasswordStrengthComponent {}
