import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { FormGroup, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../environments/environment.development';
import { UsersService } from '../../../services/users.service';
import { Nucleo } from '../../../model/nucleo';

import { Brigada } from '../../../model/brigada';
import Swal from 'sweetalert2';
import { UserSave } from '../../../model/usesave';
import { MenuService } from '../../../services/menu.service';
import { Unidad } from '../../../model/unidad';
import { Userrs } from '../../../model/Userrs';
import { AdminRolesMenuService } from '../../../services/admin-roles-menu.service';
import { RoleAdmin } from '../../../model/role-admin';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  message: string;
  error: string;

  usuarioChasqui: string;
  usernames: string;
  usuarioChasquiDisabled: boolean = true;
  status_qr: number = 0;
  cipSuper: string;

  selectedNucleo: any;
  selectedBrigada: any;
  selectedDependencia: any;

  cip: string;
  cuenta: string;
  descripcion: string;
  username: string;
  grado: string;
  fullname: string;
  arma: string;
  nucleouser: string;
  brigadauser:string;
  unidaduser:string;

  idnucleo:string;
  idbrigada:string;
  idunidad:string;

  estado: number;
  dni: string;
  telefono: string;
  nivel: number;
  roles: RoleAdmin[] = [];

  nucleo: Nucleo[] = [];
  brigada: Brigada[] = [];
  dependencia: Unidad[] = [];


  idsRoles: number[] = [];
  userForm: FormGroup;
  @Output() cerrarDialogo = new EventEmitter<void>();

  constructor(

    private userService: UsersService,
    private adminRolesService: AdminRolesMenuService,
  ) { }

  ngOnInit(): void {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    const decodedToken = helper.decodeToken(token);
    this.usernames = decodedToken.sub;
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.adminRolesService.listarRoles().subscribe({
      next: roles => this.roles = roles,
      error: () => Swal.fire('Error', 'No se pudieron cargar los roles', 'error'),
    });
  }
    //buscar por cip  para registrar
    obtenerdataporcip(cip: string): void {
      this.userService.getBycip(cip).subscribe(data => {
      this.cip = data.cip;
      this.cuenta = data.cuenta.toUpperCase();
      this.descripcion = data.descripcion;
      });
    }

  crearUsuario() {
    if (this.camposLlenos()) {
      const newUser: UserSave = {
        cip: this.cip,
        username: this.cuenta,
        fullname: this.descripcion,
        nivel: this.nivel,
      };
      this.idsRoles = [this.nivel];
      this.userService.saveUser(newUser, this.idsRoles).subscribe(data => {
        Swal.fire({
          title: "Usuario",
          text: "Usuario registrado correctamente!",
          icon: "success"
        });

        this.cip = null;
        this.username = '';
        this.fullname = '';
        this.nivel = null;
        this.cerrarDialogo.emit();

      });
    }
  }


  camposLlenos(): boolean {
    return !!this.cip &&
    !!this.nivel&&
    !!this.cuenta&&
    !!this.descripcion;
  }


  validarNumero(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  validarLongitud() {
    if (this.cip && this.cip.length > 9) {
      this.cip = this.cip.slice(0, 9);
    }
  }
  limpiarCampo() {
    this.cip = null;
    this.descripcion = null;
    this.cuenta = null;
    this.nivel = null;
  }
}
