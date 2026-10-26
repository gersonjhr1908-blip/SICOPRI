import { ChangeDetectorRef, Component, EventEmitter, Inject, Output } from '@angular/core';
import { AuthenticationResponse } from '../../model/authentication-response';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { environment } from '../../../environments/environment.development';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-mfa',
  standalone: true,
  imports: [MaterialModule, FormsModule, CommonModule],
  templateUrl: './modal-mfa.component.html',
  styleUrl: './modal-mfa.component.css'
})
export class ModalMfaComponent {


  @Output() cerrarDialogo = new EventEmitter<void>();
  status: any;
  secretImageUri: any;
  authResponse: AuthenticationResponse = {};
  otpCode = '';
  showProgressBar: boolean = false;
  intentos: number = 0;
  private dialogCloseTimer: any;
  tiempoRestante: number;
  botonBloqueado: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ModalMfaComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private loginService: LoginService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.status = this.data.response.status;
    if (this.data.response.status == "0") {
      this.saveTwoFactor();
    }else {
      this.status = 1
    }
     this.startDialogCloseTimer();
  }
  ngOnDestroy(): void {
    clearTimeout(this.dialogCloseTimer);
  }

  saveTwoFactor(): void {
    if (this.data.response.secretImageUri && !this.data.response.secretImageUri.startsWith('data:image/png;base64,')) {
      this.data.response.secretImageUri = 'data:image/png;base64,' + this.data.response.secretImageUri;
    }
    this.authResponse = this.data.response.secretImageUri;
  }

  private startDialogCloseTimer(): void {
    const tiempoTotal = 60;
    this.tiempoRestante = tiempoTotal;
    this.dialogCloseTimer = setInterval(() => {
      if (this.tiempoRestante > 0) {
        this.tiempoRestante--;
        if (this.tiempoRestante === 0) {
          this.cerrarDialogo.emit();
          clearInterval(this.dialogCloseTimer);
        }
      }
    }, 1000);
  }

  validarNumero(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
    return this.SecretVerify();
  }

  validarLongitud() {
    if (this.otpCode && this.otpCode.length > 6) {
      this.otpCode = this.otpCode.slice(0, 6);
    }
  }

  SecretVerify() {
    if (this.otpCode.length !== 6) {
      console.error('Invalid OTP code length');
      return;
    }
    this.cd.detectChanges();
    const verifyRequest: any = {
      cip: this.data.response.cip,
      code: this.otpCode,
      username: this.data.username
    };
    this.loginService.verifyCode(verifyRequest).subscribe({
      next: (response) => {
        if (response && response.access_token) {
          sessionStorage.setItem(environment.TOKEN_NAME, response.access_token);
          this.router.navigate(['pages/home']);
          this.cerrarDialogo.emit();
        } else {
          console.error('No access_token in response');
        }
      },
      error: (err) => {
        console.error('Error in verifyCode:', err);
      }
    });
  }




}
