import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment.development';

export interface JwtRequest {
  username: string;
  password: string;
  token: string;
}

export interface LocalLoginRequest {
  username: string;
  password: string;
}

export interface LocalLoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly url = `${environment.HOST}/login`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Login temporal del backend local.
  loginLocal(
    request: LocalLoginRequest
  ): Observable<LocalLoginResponse> {
    return this.http.post<LocalLoginResponse>(
      `${this.url}/local`,
      request
    ).pipe(
      tap(response => {
        if (!response.access_token) {
          throw new Error(
            'El backend no devolvió el token de acceso local'
          );
        }

        sessionStorage.setItem(
          environment.TOKEN_NAME,
          response.access_token
        );
      })
    );
  }

  // Se conserva para compatibilidad con el código existente.
  login(jwtRequest: JwtRequest): Observable<any> {
    return this.http.post<any>(
      `${this.url}/ad`,
      jwtRequest
    );
  }

  verifyCode(
    verificationRequest: any
  ): Observable<any> {
    return this.http.post<any>(
      `${this.url}/verify`,
      verificationRequest
    );
  }

  logout(): void {
    sessionStorage.clear();
    void this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    const token = sessionStorage.getItem(
      environment.TOKEN_NAME
    );

    return Boolean(token);
  }
}