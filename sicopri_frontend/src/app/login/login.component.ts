import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators
} from '@angular/forms';

import Swal from 'sweetalert2';

import { MaterialModule } from '../material/material.module';

import { LoginService } from '../services/login.service';
import { UsersService } from '../services/users.service';

import { environment } from '../../environments/environment.development';

import { MatDialog } from '@angular/material/dialog';

import { JwtHelperService } from '@auth0/angular-jwt';

import { ModalMfaComponent } from './modal-mfa/modal-mfa.component';

import { ReCaptchaV3Service } from 'ng-recaptcha';

import { timer } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    MaterialModule,
    NgIf,
    FormsModule
  ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  error: string = '';
  message: string = '';

  username: string = '';
  fullname: string = '';
  password: string = '';

  loading: boolean = false;

  recaptchaToken: string = '';

  year: number = new Date().getFullYear();


  _formulario: FormGroup;


  constructor(

    private recaptchaV3Service: ReCaptchaV3Service,

    public dialog: MatDialog,

    private loginService: LoginService,

    private userService: UsersService

  ) {

    this._formulario = new FormGroup({

      username: new FormControl(
        '',
        Validators.required
      ),

      password: new FormControl(
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      )

    });

  }


  // ==========================================
  // LOGIN
  // ==========================================
  login(): void {

    if (this._formulario.invalid) {

      this._formulario.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Ingrese su usuario y contraseña.',
        confirmButtonText: 'Aceptar'
      });

      return;
    }


    this.loading = true;

    this.error = '';

    this.message = '';


    const swalLoading = Swal.mixin({

      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html-container',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button'
      },

      didOpen: () => {

        Swal.showLoading();

        const popup = Swal.getPopup();

        if (popup) {

          popup.style.background =
            'linear-gradient(120deg, #007bea, #092d68)';

          popup.style.color = '#ffffff';

          popup.style.borderRadius = '15px';

          popup.style.boxShadow =
            '0 20px 30px rgba(0,0,0,0.4)';

        }

      }

    });


    swalLoading.fire({

      title: 'Iniciando Sesión',

      html: `
        <div style="
          font-family: Arial, sans-serif;
          font-size: 18px;
          color: #ffffff;
        ">
          Verificando credenciales...
        </div>
      `,

      allowOutsideClick: false,

      showConfirmButton: false

    });


    // Primero obtenemos token reCAPTCHA
    this.executeReCaptcha('login_action');

  }


  // ==========================================
  // RECAPTCHA
  // ==========================================
  executeReCaptcha(action: string): void {

    this.recaptchaV3Service
      .execute(action)
      .subscribe({

        next: (token) => {

          this.recaptchaToken = token;


          /*
           * Dejamos el pequeño delay que utiliza
           * el proyecto VPN.
           */

          const source = timer(1000);

          source.subscribe(() => {

            this.performLogin();

          });

        },


        error: (err) => {

          console.error(
            'Error en ReCAPTCHA v3:',
            err
          );

          this.error =
            'No se pudo validar reCAPTCHA.';

          this.handleError();


          Swal.fire({
            icon: 'error',
            title: 'Error de seguridad',
            text: 'No se pudo validar reCAPTCHA.',
            confirmButtonText: 'Aceptar'
          });

        }

      });

  }


  // ==========================================
  // LOGIN CONTRA BACKEND
  // ==========================================
  performLogin(): void {

    const jwtRequest = {

      username:
        this.username.trim().toUpperCase(),

      password:
        this.password,

      token:
        this.recaptchaToken

    };


    this.loginService
      .login(jwtRequest)
      .subscribe({

        next: (response: any) => {

          console.log(
            'Respuesta /login/ad:',
            response
          );


          /*
           * El VPN utiliza response.data.
           * Ahí debería venir:
           *
           * status
           * cip
           * secretImageUri
           * etc.
           */



          // Abrir Google Authenticator
          this.openModalMfa(
            this.username,
            response
          );

        },


        error: (err) => {

          console.error(
            'Error /login/ad:',
            err
          );

          this.error =
            'Inicio de sesión fallido';

          this.handleError();


          Swal.fire({
            icon: 'error',
            title: 'Inicio de sesión fallido',
            text:
              err?.error?.message
              || err?.error?.mensaje
              || 'Verifique su usuario y contraseña.',
            confirmButtonText: 'Aceptar'
          });

        }

      });

  }


  // ==========================================
  // MODAL GOOGLE AUTHENTICATOR
  // ==========================================
  openModalMfa(
    username: string,
    response: any
  ): void {

    this.handleError();


    const dialogRef =
      this.dialog.open(
        ModalMfaComponent,
        {

          disableClose: true,

          data: {

            username:
              username,

            response:
              response

          }

        }
      );


    /*
     * Este evento viene del ModalMfaComponent
     * cuando el código de Google Authenticator
     * fue validado correctamente.
     */

    dialogRef
      .componentInstance
      .cerrarDialogo
      .subscribe(() => {

        dialogRef.close();

        this.onLoginSuccess();

      });

  }


  // ==========================================
  // LOGIN COMPLETADO
  // ==========================================
  onLoginSuccess(): void {

    const token =
      sessionStorage.getItem(
        environment.TOKEN_NAME
      );


    if (!token) {

      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: 'No se recibió el token de acceso.',
        confirmButtonText: 'Aceptar'
      });

      return;
    }


    try {

      const helper =
        new JwtHelperService();


      const decodedToken =
        helper.decodeToken(token);


      this.username =
        decodedToken?.sub ?? '';


      if (!this.username) {

        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: 'No se pudo identificar al usuario.',
          confirmButtonText: 'Aceptar'
        });

        return;

      }


      // Obtener datos completos del usuario
      this.userService
        .getByUsername(this.username)
        .subscribe({

          next: (resp: any) => {

            /*
             * En el VPN aparentemente viene:
             *
             * resp.data.fullname
             */

            this.fullname =
              resp?.data?.fullname
              || this.username;


            Swal.fire({

              icon: 'success',

              title: 'Bienvenido al SIQRED',

              text: this.fullname,

              confirmButtonText:
                'Ingresar al sistema',

              confirmButtonColor:
                '#0b5ca8'

            });

          },


          error: (error) => {

            console.error(
              'Error obteniendo usuario:',
              error
            );


            Swal.fire({

              icon: 'success',

              title: 'Bienvenido al SIQRED',

              text: this.username,

              confirmButtonText:
                'Ingresar al sistema',

              confirmButtonColor:
                '#0b5ca8'

            });

          }

        });


    } catch (error) {

      console.error(
        'Error decodificando JWT:',
        error
      );

    }

  }


  // ==========================================
  // MAYÚSCULAS
  // ==========================================
  convertirAMayusculas(): void {

    if (this.username) {

      this.username =
        this.username.toUpperCase();


      this._formulario
        .get('username')
        ?.setValue(
          this.username,
          {
            emitEvent: false
          }
        );

    }

  }


  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================
  resetForm(): void {

    this.username = '';

    this.password = '';

    this.fullname = '';

    this.error = '';

    this.message = '';

    this._formulario.reset();

  }


  // ==========================================
  // CERRAR LOADING
  // ==========================================
  handleError(): void {

    this.loading = false;

    Swal.close();

  }


  handleSuccess(): void {

    this.loading = false;

    Swal.close();

  }

}