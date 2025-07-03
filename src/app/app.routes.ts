import { Routes } from '@angular/router';
import { LoginComponent } from './routes/auth/login/login.component';
import { SignUpComponent } from './routes/auth/sign-up/sign-up.component';

export const routes: Routes = [
  {
    path: 'zenLogin',
    component: LoginComponent,
  },
  {
    path: 'zenSignUp',
    component: SignUpComponent,
  },
];
