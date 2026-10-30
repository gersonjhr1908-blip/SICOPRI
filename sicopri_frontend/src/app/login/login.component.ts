import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { MaterialModule } from '../material/material.module';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MaterialModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  year = new Date().getFullYear();
  loading = false;
  error = '';
  message = '';

  _formulario = new FormGroup({
    username: new FormControl('ADMIN_LOCAL', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  convertirAMayusculas(): void {
    const control = this._formulario.controls.username;

    control.setValue(
      control.value.toUpperCase(),
      { emitEvent: false }
    );
  }

  login(): void {
    if (this.loading) {
      return;
    }

    if (this._formulario.invalid) {
      this._formulario.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    const values = this._formulario.getRawValue();

    // Elimina cualquier sesión anterior antes de iniciar otra.
    sessionStorage.clear();

    this.loginService.loginLocal({
      username: values.username.trim().toUpperCase(),
      password: values.password
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => {
        this._formulario.controls.password.reset();

        void this.router.navigate(['/pages/home']);
      },
      error: (err) => {
        if (err.status === 0) {
          this.error =
            'No se pudo conectar con el backend local. ' +
            'Comprueba que esté iniciado en el puerto 8080.';
          return;
        }

        this.error =
          err?.error?.message ||
          err?.error?.mensaje ||
          err?.message ||
          'No se pudo iniciar la sesión local.';
      }
    });
  }
}