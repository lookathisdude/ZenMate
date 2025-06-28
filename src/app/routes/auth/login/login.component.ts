import { Component } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('stagger', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('100ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordStrength: number = 0;
  showPassword = false;
  strengthColor: ThemePalette;
  isSubmited = false;

  requirements = [
    { description: 'At least 8 characters', regex: /.{8,}/ },
    { description: 'At least 1 uppercase letter', regex: /[A-Z]/ },
    { description: 'At least 1 lowercase letter', regex: /[a-z]/ },
    { description: 'At least 1 number', regex: /\d/ },
    { description: 'At least 1 special character', regex: /[@$!%*?&]/ },
  ];

  constructor(private formBuilder: FormBuilder, private snackBar: MatSnackBar) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
    });

    this.loginForm.get('password')?.valueChanges.subscribe((value) => {
      this.calculatePasswordStrength(value);
    });
  }

  calculatePasswordStrength(password: string) {
    let passwordStrength = 0;
    this.requirements.forEach((requirement) => {
      if (requirement.regex.test(password)) passwordStrength += 1;
    });

    this.passwordStrength = Math.min(Math.floor(passwordStrength / 1.66), 3);

    switch (this.passwordStrength) {
      case 0:
        this.strengthColor = undefined;
        break;
      case 1:
        this.strengthColor = 'warn';
        break;
      case 2:
        this.strengthColor = 'accent';
        break;
      case 3:
        this.strengthColor = 'primary';
        break;
    }
  }

  getPasswordStatus(regex: RegExp): boolean {
    return regex.test(this.loginForm.get('password')?.value);
  }

  onSubmit() {
    this.isSubmited = true;

    if (this.loginForm.valid) {
      if (this.passwordStrength < 2) {
        this.snackBar.open(
          'Password is too weak. Please strengthen your password.',
          'OK',
          {
            duration: 5000,
            panelClass: ['mat-toolbar', 'mat-warn'],
          }
        );
        return;
      }
      console.log('Form submitted:', this.loginForm.value);
      this.snackBar.open('Login successful!', 'OK', {
        duration: 3000,
        panelClass: ['mat-toolbar', 'mat-primary'],
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
