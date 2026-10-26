import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { FormGroup, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Nucleo } from '../../../model/nucleo';
import { Brigada } from '../../../model/brigada';
import { Unidad } from '../../../model/unidad';
import { UsersService } from '../../../services/users.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../environments/environment.development';
import Swal from 'sweetalert2';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../model/users';
import { UserUpdate } from '../../../model/userupdate';
import { UserSave } from '../../../model/usesave';
import { AdminRolesMenuService } from '../../../services/admin-roles-menu.service';
import { RoleAdmin } from '../../../model/role-admin';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit {

  message: string;
  error: string;
  id:  number;
  cip: string;
  username: string;
  fullname: string;
  nivel: number;
  usernames: string;
  roles: RoleAdmin[] = [];

  idsRoles: number[] = [];
  userForm: FormGroup;
  @Output() cerrarDialogo = new EventEmitter<void>();

  user: User;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,

    private userService: UsersService,
    private adminRolesService: AdminRolesMenuService,
  ) { }

  ngOnInit(): void {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    const decodedToken = helper.decodeToken(token);
    this.usernames = decodedToken.sub;
    this.cargarRoles();
    this.obtenerDatosElemento();
  }

  cargarRoles(): void {
    this.adminRolesService.listarRoles().subscribe({
      next: roles => this.roles = roles,
      error: () => Swal.fire('Error', 'No se pudieron cargar los roles', 'error'),
    });
  }


  obtenerDatosElemento() {
    this.userService.getByUsername(this.data.username).subscribe(
      (user: User) => {
        this.id = this.data.id;
        this.cip = user.cip;
        this.username = user.username;
        this.fullname = user.fullname;
        const roles = user.roles;
        this.nivel = Array.isArray(roles) ? roles[0]?.idRole : roles?.idRole;
      },
      error => {
        console.log('Error al obtener los datos de la experiencia:', error);
      }
    );
  }

  actualizarUsuario() {
    if (this.camposLlenos()) {
      const newUser: UserSave = {
        cip: this.cip,
        username: this.username,
        fullname: this.fullname,
        nivel: this.nivel

      };

      this.idsRoles = [this.nivel];

      this.userService.updateUser(this.data.id , newUser, this.idsRoles).subscribe(data => {
        Swal.fire({
          title: "Usuario",
          text: "Usuario actualizado correctamente!",
          icon: "success"
        });

        this.cip = null;
        this.username = '';
       this.fullname = '';
       // this.selectedNucleo = null;
       // this.selectedBrigada = null;
        //this.unidad = null;
        //this.cargo = '';
        this.nivel = null;
      });
      this.cerrarDialogo.emit(); //
    }
  }

  camposLlenos(): boolean {
    return !!this.cip && !!this.nivel;
  }

  getbyCip(cip: string) {
    this.userService.getByCip(this.cip).subscribe(data => {
      const resultado = data.chasqui.replace('@ejercito.mil.pe', '')
      this.username = resultado.toUpperCase();
      this.fullname= data.nombres;
    });
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
/*
  convertirAMayusculas() {
    if (this.cargo) {
      this.cargo = this.cargo.toUpperCase();
    }
  }
*/

  limpiarCampo() {
    this.cip = null;
    this.fullname = '';
    this.username = '';
    this.nivel = null;
  }
}
