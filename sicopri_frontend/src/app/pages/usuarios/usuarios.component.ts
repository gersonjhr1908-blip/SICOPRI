import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import {
  Role,
  Nucleo,
  Brigada,
  Unidad,
  UsersService
} from '../../services/users.service';;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  // =========================
  // TABLA
  // =========================
  usuarios: any[] = [];

  totalUsuarios: number = 0;

  search: string = '';

  page: number = 0;
  pageSize: number = 10;

  loadingTabla: boolean = false;


  // =========================
  // MODAL
  // =========================
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;

  userIdEditar: number | null = null;


  // =========================
  // FORMULARIO
  // =========================
  cip: string = '';

  username: string = '';
  grado: string = '';
  arma: string = '';
  fullname: string = '';

  nucleoCodigo: string = '';
  nucleoNombre: string = '';

  brigadaCodigo: string = '';
  brigadaNombre: string = '';

  unidadCodigo: string = '';
  unidadNombre: string = '';

  nucleos: Nucleo[] = [];
  brigadas: Brigada[] = [];
  unidades: Unidad[] = [];

  rolSeleccionado: number | null = null;

  roles: Role[] = [];

  buscandoCip: boolean = false;


  constructor(
    private usersService: UsersService
  ) { }


  ngOnInit(): void {

    this.cargarUsuarios();

    this.cargarRoles();

    this.cargarNucleos();
  }


  // =====================================================
  // LISTADO
  // =====================================================

  cargarUsuarios(): void {

    this.loadingTabla = true;

    this.usersService
      .listPageable(
        this.search,
        this.page,
        this.pageSize
      )
      .subscribe({

        next: (response: any) => {

          console.log(
            'LISTA USUARIOS:',
            response
          );

          this.usuarios =
            response?.content ?? [];

          this.totalUsuarios =
            response?.totalElements ?? 0;

          this.loadingTabla = false;
        },

        error: (err) => {

          console.error(
            'Error cargando usuarios',
            err
          );

          this.loadingTabla = false;

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la lista de usuarios.'
          });
        }

      });
  }


  buscarUsuarios(): void {

    this.page = 0;

    this.cargarUsuarios();
  }


  limpiarBusqueda(): void {

    this.search = '';

    this.page = 0;

    this.cargarUsuarios();
  }


  // =====================================================
  // ROLES
  // =====================================================

  cargarRoles(): void {

    this.usersService
      .getRoles()
      .subscribe({

        next: (roles) => {

          this.roles = roles;

          console.log(
            'ROLES:',
            roles
          );
        },

        error: (err) => {

          console.error(
            'Error cargando roles',
            err
          );
        }

      });
  }


  // =====================================================
// UBICACIÓN ORGÁNICA
// NÚCLEO -> BRIGADA -> UNIDAD
// =====================================================

cargarNucleos(): void {

  this.usersService
    .getNucleos()
    .subscribe({

      next: (data: Nucleo[]) => {

        this.nucleos = data;

        console.log('NÚCLEOS:', data);
      },

      error: (err) => {

        console.error(
          'Error cargando núcleos',
          err
        );

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los núcleos.'
        });
      }

    });
}


onNucleoChange(): void {

  this.brigadaCodigo = '';
  this.brigadaNombre = '';

  this.unidadCodigo = '';
  this.unidadNombre = '';

  this.brigadas = [];
  this.unidades = [];

  if (!this.nucleoCodigo) {
    return;
  }

  const nucleoSeleccionado =
    this.nucleos.find(
      n => n.idNucleo === this.nucleoCodigo
    );

  this.nucleoNombre =
    nucleoSeleccionado?.nombre ?? '';

  this.usersService
    .getBrigadas(this.nucleoCodigo)
    .subscribe({

      next: (data: Brigada[]) => {

        this.brigadas = data;

        console.log('BRIGADAS:', data);
      },

      error: (err) => {

        console.error(
          'Error cargando brigadas',
          err
        );

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las brigadas.'
        });
      }

    });
}


onBrigadaChange(): void {

  this.unidadCodigo = '';
  this.unidadNombre = '';

  this.unidades = [];

  if (
    !this.nucleoCodigo ||
    !this.brigadaCodigo
  ) {
    return;
  }

  const brigadaSeleccionada =
    this.brigadas.find(
      b => b.idBrigada === this.brigadaCodigo
    );

  this.brigadaNombre =
    brigadaSeleccionada?.nombre ?? '';

  this.usersService
    .getUnidades(
      this.nucleoCodigo,
      this.brigadaCodigo
    )
    .subscribe({

      next: (data: Unidad[]) => {

        this.unidades = data;

        console.log('UNIDADES:', data);
      },

      error: (err) => {

        console.error(
          'Error cargando unidades',
          err
        );

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las unidades.'
        });
      }

    });
}


onUnidadChange(): void {

  const unidadSeleccionada =
    this.unidades.find(
      u => u.idUnidad === this.unidadCodigo
    );

  this.unidadNombre =
    unidadSeleccionada?.nombre ?? '';
}

  // =====================================================
  // MODAL NUEVO
  // =====================================================


  // =====================================================
  // MODAL NUEVO
  // =====================================================

  abrirNuevoUsuario(): void {

    this.limpiarFormulario();

    this.modoEdicion = false;

    this.mostrarModal = true;
  }


  cerrarModal(): void {

    this.mostrarModal = false;

    this.limpiarFormulario();
  }


  // =====================================================
  // BUSCAR CIP
  // =====================================================

  onCipInput(): void {

    // Solo permite números y máximo 9 dígitos
    this.cip = this.cip
      .replace(/\D/g, '')
      .slice(0, 9);

    // Cuando llegue a 9 dígitos busca automáticamente
    if (this.cip.length === 9) {
      this.buscarPorCip();
    }
  }

  buscarPorCip(): void {

    const cipLimpio =
      this.cip.trim();

    if (!cipLimpio) {

      return;
    }

    if (cipLimpio.length !== 9) {

      Swal.fire({
        icon: 'warning',
        title: 'CIP inválido',
        text: 'El CIP debe contener 9 caracteres.'
      });

      return;
    }

    this.buscandoCip = true;

    this.usersService
      .getByCip(cipLimpio)
      .subscribe({

        next: (persona: any) => {

          console.log(
            'PERSONA:',
            persona
          );

          this.username =
            persona?.chasqui ?? '';

          this.grado =
            persona?.gradoNombre ?? '';

          this.arma =
            persona?.armaNombre ?? '';

          this.fullname = [
            persona?.apellidoPaterno,
            persona?.apellidoMaterno,
            persona?.nombres
          ]
            .filter(Boolean)
            .join(' ');

          this.buscandoCip = false;


          if (!this.username) {

            Swal.fire({
              icon: 'warning',
              title: 'Sin usuario Chasqui',
              text: 'La persona fue encontrada, pero no tiene usuario Chasqui registrado.'
            });
          }

        },

        error: (err) => {

          console.error(
            'Error buscando CIP',
            err
          );

          this.buscandoCip = false;

          this.limpiarDatosPersona();

          Swal.fire({
            icon: 'error',
            title: 'No encontrado',
            text: 'No se encontró una persona con ese CIP.'
          });
        }

      });
  }


  // =====================================================
  // GUARDAR
  // =====================================================

  guardarUsuario(): void {

    if (!this.cip) {

      Swal.fire({
        icon: 'warning',
        title: 'Falta CIP',
        text: 'Ingrese el CIP del usuario.'
      });

      return;
    }


    if (!this.username) {

      Swal.fire({
        icon: 'warning',
        title: 'Usuario no válido',
        text: 'Primero busque un CIP válido.'
      });

      return;
    }


    if (!this.rolSeleccionado) {

      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un rol',
        text: 'Debe seleccionar el rol del usuario.'
      });

      return;
    }


    const usuario: any = {

      cip: this.cip,

      username: this.username,

      fullname: this.fullname,

      grado: this.grado,

      arma: this.arma,

      idNucleo:
        this.nucleoCodigo,

      idBrigada:
        this.brigadaCodigo,

      idUnidad:
        this.unidadCodigo,

      roleActiveIdRole:
        this.rolSeleccionado
    };


    Swal.fire({

      title:
        this.modoEdicion
          ? 'Actualizando usuario...'
          : 'Registrando usuario...',

      allowOutsideClick: false,

      didOpen: () => {
        Swal.showLoading();
      }

    });


    if (this.modoEdicion &&
      this.userIdEditar !== null) {

      this.usersService
        .updateUser(
          this.userIdEditar,
          usuario,
          [this.rolSeleccionado]
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              confirmButtonText: 'Aceptar'
            });

            this.cerrarModal();

            this.cargarUsuarios();
          },

          error: (err) => {

            console.error(err);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el usuario.'
            });
          }

        });

    } else {

      this.usersService
        .saveUser(
          usuario,
          [this.rolSeleccionado]
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Usuario registrado',
              text: 'El usuario fue registrado correctamente.',
              confirmButtonText: 'Aceptar'
            });

            this.cerrarModal();

            this.cargarUsuarios();
          },

          error: (err) => {

            console.error(err);

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text:
                err?.error?.message ??
                'No se pudo registrar el usuario.'
            });
          }

        });
    }
  }


  // =====================================================
  // EDITAR
  // =====================================================

  editarUsuario(usuario: any): void {

    this.modoEdicion = true;

    this.userIdEditar =
      usuario.idUser;

    this.cip =
      usuario.cip ?? '';

    this.username =
      usuario.username ?? '';

    this.grado =
      usuario.grado ?? '';

    this.arma =
      usuario.arma ?? '';

    this.fullname =
      usuario.fullname ?? '';

    this.nucleoCodigo =
      usuario.idNucleo ?? '';

    this.brigadaCodigo =
      usuario.idBrigada ?? '';

    this.unidadCodigo =
      usuario.idUnidad ?? '';


    if (usuario.roles?.length) {

      this.rolSeleccionado =
        usuario.roles[0].idRole;

    } else {

      this.rolSeleccionado =
        null;
    }


    // Actualizamos datos militares
    // desde EP_PERSONAS.
    if (this.cip) {

      this.buscarPorCip();
    }


    this.mostrarModal = true;
  }


  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarUsuario(usuario: any): void {

    Swal.fire({

      icon: 'warning',

      title: '¿Eliminar usuario?',

      html:
        `Se eliminará a <b>${usuario.username}</b>.`,

      showCancelButton: true,

      confirmButtonText: 'Sí, eliminar',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#c62828'

    }).then((result) => {

      if (!result.isConfirmed) {

        return;
      }


      this.usersService
        .eliminarUsuario(
          String(usuario.idUser)
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              confirmButtonText: 'Aceptar'
            });

            this.cargarUsuarios();
          },

          error: (err) => {

            console.error(err);

            Swal.fire({
              icon: 'error',
              title: 'No se pudo eliminar',
              text:
                err?.error?.message ??
                'Ocurrió un error eliminando el usuario.'
            });
          }

        });

    });
  }


  // =====================================================
  // HELPERS
  // =====================================================

  obtenerRol(usuario: any): string {

    if (!usuario?.roles ||
      usuario.roles.length === 0) {

      return 'SIN ROL';
    }

    return usuario.roles
      .map((rol: any) =>
        rol.name ??
        rol.nombre ??
        ''
      )
      .filter(Boolean)
      .join(', ');
  }


  limpiarFormulario(): void {

    this.cip = '';

    this.username = '';

    this.grado = '';

    this.arma = '';

    this.fullname = '';

    this.nucleoCodigo = '';
    this.nucleoNombre = '';

    this.brigadaCodigo = '';
    this.brigadaNombre = '';

    this.unidadCodigo = '';
    this.unidadNombre = '';

    this.rolSeleccionado = null;

    this.userIdEditar = null;

    this.modoEdicion = false;
  }


  limpiarDatosPersona(): void {

    this.username = '';

    this.grado = '';

    this.arma = '';

    this.fullname = '';

    this.nucleoCodigo = '';
    this.nucleoNombre = '';

    this.brigadaCodigo = '';
    this.brigadaNombre = '';

    this.unidadCodigo = '';
    this.unidadNombre = '';
  }

}