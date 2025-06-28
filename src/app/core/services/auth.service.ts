import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  //   private apiUrl = environment.apiUrl;
  private jwtHelper = new JwtHelperService();
  private currentUser = new BehaviorSubject<any>(null);
  private currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient, private router: Router) {}
}
