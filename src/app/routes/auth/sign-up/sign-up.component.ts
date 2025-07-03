import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease', style({ opacity: 1 })),
      ]),
    ]),
    trigger('stagger', [
      transition(':enter', [
        query('.form-field', [
          style({ transform: 'translateY(10px)', opacity: 0 }),
          stagger(
            100,
            animate('400ms ease-out', style({ transform: 'none', opacity: 1 }))
          ),
        ]),
      ]),
    ]),
  ],
})
export class SignUpComponent {
  signUpForm: FormGroup;
  showPassword = false;
  isSubmited = false;
  passwordStrength: 'Weak' | 'Medium' | 'Strong' | null = null;
  passwordRules = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  };

  constructor(private fb: FormBuilder) {
    this.signUpForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this.advancedPasswordValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  advancedPasswordValidator = (control: AbstractControl) => {
    const value = control.value || '';
    this.passwordRules = {
      minLength: value.length >= 8,
      hasUpper: /[A-Z]/.test(value),
      hasLower: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[\W_]/.test(value),
    };
    const isValid = Object.values(this.passwordRules).every(Boolean);
    this.updateStrength(value);
    return isValid ? null : { invalidPassword: true };
  };

  passwordsMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    if (password !== confirm) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  updateStrength(value: string) {
    const score =
      Number(this.passwordRules.hasUpper) +
      Number(this.passwordRules.hasLower) +
      Number(this.passwordRules.hasNumber) +
      Number(this.passwordRules.hasSpecial);

    if (value.length < 8 || score <= 2) this.passwordStrength = 'Weak';
    else if (score === 3) this.passwordStrength = 'Medium';
    else this.passwordStrength = 'Strong';
  }

  get fullName() {
    return this.signUpForm.get('fullName');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  onSubmit() {
    this.isSubmited = true;
    if (this.signUpForm.valid) {
      console.log('✅ Form submitted', this.signUpForm.value);
    }
  }

  authWithGoogle() {
    console.log('Google login...');
  }
}
