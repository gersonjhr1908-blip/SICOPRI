import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { A11yModule } from '@angular/cdk/a11y';
import {
  Subject,
  catchError,
  forkJoin,
  of,
  takeUntil
} from 'rxjs';
import Swal from 'sweetalert2';

import {
  Role,
  Nucleo,
  Brigada,
  Unidad,
  UsersService
} from '../../services/users.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    A11yModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit, OnDestroy {

  // =========================
  // TABLA
  // =========================

  usuarios: any[] = [];
  totalUsuarios = 0;

  search = '';
  page = 0;
  pageSize = 10;

  loadingTabla = false;

  // =========================
  // MODAL
  // =========================

  mostrarModal = false;
  modoEdicion = false;
  modoSoloLectura = false;

  userIdEditar: number | null = null;
  usuarioActual: any = null;

  // =========================
  // DATOS PERSONALES
  // =========================

  cip = '';
  username = '';
  grado = '';
  arma = '';
  fullname = '';

  // =========================
  // UBICACIÓN ORGÁNICA
  // =========================

  nucleoCodigo = '';
  brigadaCodigo = '';
  unidadCodigo = '';

  nucleoNombre = '';
  brigadaNombre = '';
  unidadNombre = '';

  nucleos: Nucleo[] = [];
  brigadas: Brigada[] = [];
  unidades: Unidad[] = [];

  // =========================
  // INSPECTORÍA
  // =========================

  nucleoIgCodigo = '';
  igCodigo = '';

  inspectorias: Brigada[] = [];

  // Ignora respuestas antiguas al cambiar de selección.
  private versionInspectoria = 0;

  // =========================
  // ROLES
  // =========================

  rolSeleccionado: number | null = null;
  roles: Role[] = [];

  buscandoCip = false;
  errorCatalogos = '';

  private modalCerrado$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarNucleos();
  }

  ngOnDestroy(): void {
    this.modalCerrado$.next();
    this.modalCerrado$.complete();

    this.destroy$.next();
    this.destroy$.complete();
  }

  // Administrador no aparece entre los roles para asignar.
  get rolesAsignables(): Role[] {
    return this.roles.filter(
      rol => Number(rol.idRole) !== 1
    );
  }

  // Permite conservar los roles del administrador existente.
  get administradorActual(): boolean {
    return this.usuarioActual?.roles?.some(
      (rol: Role) => Number(rol.idRole) === 1
    ) ?? false;
  }

  // =========================
  // LISTADO
  // =========================

  cargarUsuarios(): void {
    this.loadingTabla = true;

    this.usersService
      .listPageable(
        this.search,
        this.page,
        this.pageSize
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.usuarios = response?.content ?? [];
          this.totalUsuarios = response?.totalElements ?? 0;
          this.loadingTabla = false;
        },
        error: () => {
          this.loadingTabla = false;

          void Swal.fire({
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

  // =========================
  // CATÁLOGOS
  // =========================

  cargarRoles(): void {
    this.usersService
      .getRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: roles => {
          this.roles = roles;
        },
        error: err => {
          console.error('Error cargando roles', err);
        }
      });
  }

  cargarNucleos(): void {
    this.usersService
      .getNucleos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.nucleos = data;
        },
        error: () => {
          void Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los núcleos.'
          });
        }
      });
  }

  // =========================
  // CAMBIAR NÚCLEO
  // =========================

  onNucleoChange(): void {
    if (this.modoSoloLectura) return;

    this.limpiarInspectoria();

    this.brigadaCodigo = '';
    this.brigadaNombre = '';

    this.unidadCodigo = '';
    this.unidadNombre = '';

    this.brigadas = [];
    this.unidades = [];

    if (!this.nucleoCodigo) return;

    this.nucleoNombre = this.nucleos.find(
      n => String(n.idNucleo) === this.nucleoCodigo
    )?.nombre ?? '';

    const nucleoConsultado = this.nucleoCodigo;

    this.usersService
      .getBrigadas(nucleoConsultado)
      .pipe(
        takeUntil(this.modalCerrado$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: data => {
          if (this.nucleoCodigo !== nucleoConsultado) return;

          this.brigadas = data;
        },
        error: () => {
          void Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las grandes unidades.'
          });
        }
      });
  }

  // =========================
  // CAMBIAR GRAN UNIDAD
  // =========================

  onBrigadaChange(): void {
    if (this.modoSoloLectura) return;

    this.limpiarInspectoria();

    this.unidadCodigo = '';
    this.unidadNombre = '';
    this.unidades = [];

    if (!this.nucleoCodigo || !this.brigadaCodigo) return;

    this.brigadaNombre = this.brigadas.find(
      b => String(b.idBrigada) === this.brigadaCodigo
    )?.nombre ?? '';

    const nucleoConsultado = this.nucleoCodigo;
    const brigadaConsultada = this.brigadaCodigo;

    this.usersService
      .getUnidades(
        nucleoConsultado,
        brigadaConsultada
      )
      .pipe(
        takeUntil(this.modalCerrado$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: data => {
          if (
            this.nucleoCodigo !== nucleoConsultado ||
            this.brigadaCodigo !== brigadaConsultada
          ) {
            return;
          }

          this.unidades = data;
        },
        error: () => {
          void Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las unidades.'
          });
        }
      });
  }

  // =========================
  // UNIDAD → NÚCLEO IG E IG
  // =========================

  onUnidadChange(): void {
    if (this.modoSoloLectura) return;

    this.limpiarInspectoria();

    const unidad = this.unidades.find(
      u => String(u.idUnidad) === String(this.unidadCodigo)
    );

    this.unidadNombre = unidad?.nombre ?? '';

    if (!unidad) return;

    // Misma relación utilizada en QRD e Integridad.
    const nucleoIg = String(
      unidad.idNucleo ?? ''
    ).trim();

    const igAutomatico = String(
      unidad.idBrigada ?? ''
    ).trim();

    if (!nucleoIg) {
      this.errorCatalogos =
        'La unidad seleccionada no tiene un núcleo asociado.';
      return;
    }

    this.nucleoIgCodigo = nucleoIg;

    this.cargarInspectorias(igAutomatico);
  }

  obtenerEtiquetaNucleoIg(idNucleo: string | number, nombre: string): string {
  const unidad = this.unidades.find(
    u => String(u.idUnidad) === String(this.unidadCodigo)
  );

  if (!unidad || String(unidad.idNucleo) !== String(idNucleo)) {
    return nombre;
  }

  const guarnicion = String(unidad.guarnicion ?? '').trim();
  return guarnicion || nombre;
}


  // =========================
  // CAMBIO MANUAL DE NÚCLEO IG
  // =========================

  onNucleoIgChange(): void {
    if (this.modoSoloLectura) return;

    this.cargarInspectorias();
  }

  private limpiarInspectoria(): void {
    this.versionInspectoria++;

    this.nucleoIgCodigo = '';
    this.igCodigo = '';
    this.inspectorias = [];
  }

  private cargarInspectorias(igAutomatico = ''): void {
    const version = ++this.versionInspectoria;
    const nucleo = this.nucleoIgCodigo;

    this.igCodigo = '';
    this.inspectorias = [];
    this.errorCatalogos = '';

    if (!nucleo) return;

    this.usersService
      .getBrigadas(nucleo)
      .pipe(
        takeUntil(this.modalCerrado$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: data => {
          if (
            version !== this.versionInspectoria ||
            nucleo !== this.nucleoIgCodigo
          ) {
            return;
          }

          this.inspectorias = data ?? [];

          const existe = this.inspectorias.some(
            ig =>
              String(ig.idBrigada).trim() === igAutomatico
          );

          this.igCodigo = existe ? igAutomatico : '';
        },
        error: () => {
          if (version !== this.versionInspectoria) return;

          this.errorCatalogos =
            'No se pudieron cargar las inspectorías. ' +
            'Seleccione nuevamente el núcleo IG para reintentar.';
        }
      });
  }

  // =========================
  // CARGAR DATOS GUARDADOS
  // =========================

  private cargarSeleccionGuardada(alCargar?: () => void): void {
    this.errorCatalogos = '';

    const versionIg = this.versionInspectoria;

    const nucleoGuardado = this.nucleoCodigo;
    const brigadaGuardada = this.brigadaCodigo;
    const unidadGuardada = this.unidadCodigo;
    const nucleoIgGuardado = this.nucleoIgCodigo;

    const recuperar = (peticion: any) =>
      peticion.pipe(
        catchError(() => {
          this.errorCatalogos =
            'No se pudieron cargar algunas opciones. ' +
            'Se conservan los códigos guardados.';

          return of([]);
        })
      );

    forkJoin({
      brigadas: this.nucleoCodigo
        ? recuperar(
            this.usersService.getBrigadas(
              this.nucleoCodigo
            )
          )
        : of([]),

      unidades: this.nucleoCodigo && this.brigadaCodigo
        ? recuperar(
            this.usersService.getUnidades(
              this.nucleoCodigo,
              this.brigadaCodigo
            )
          )
        : of([]),

      inspectorias: this.nucleoIgCodigo
        ? recuperar(
            this.usersService.getBrigadas(
              this.nucleoIgCodigo
            )
          )
        : of([])
    })
      .pipe(takeUntil(this.modalCerrado$))
      .subscribe((data: any) => {
        if (
          nucleoGuardado !== this.nucleoCodigo ||
          brigadaGuardada !== this.brigadaCodigo ||
          unidadGuardada !== this.unidadCodigo
        ) {
          return;
        }

        this.brigadas = data.brigadas;
        this.unidades = data.unidades;

        if (
          versionIg === this.versionInspectoria &&
          nucleoIgGuardado === this.nucleoIgCodigo
        ) {
          this.inspectorias = data.inspectorias;
        }
        alCargar?.();
      });
  }

  contieneCodigo(
    lista: any[],
    campo: string,
    codigo: string
  ): boolean {
    return lista.some(
      item => String(item[campo]) === String(codigo)
    );
  }

  // =========================
  // MODAL
  // =========================

  abrirNuevoUsuario(): void {
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.modalCerrado$.next();

    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  editarUsuario(usuario: any): void {
    this.modalCerrado$.next();
    this.limpiarFormulario();

    this.usuarioActual = {
      ...usuario,
      roles: (usuario.roles ?? []).map(
        (rol: Role) => ({ ...rol })
      )
    };

    this.modoEdicion = true;
    this.userIdEditar = usuario.idUser;

    this.cip = usuario.cip ?? '';
    this.username = usuario.username ?? '';
    this.grado = usuario.grado ?? '';
    this.arma = usuario.arma ?? '';
    this.fullname = usuario.fullname ?? '';

    this.nucleoCodigo = String(
      usuario.idNucleo ?? ''
    );

    this.brigadaCodigo = String(
      usuario.idBrigada ?? ''
    );

    this.unidadCodigo = String(
      usuario.idUnidad ?? ''
    );

    this.nucleoIgCodigo = String(
      usuario.idNucleoIg ?? ''
    );

    this.igCodigo = String(
      usuario.idIg ?? ''
    );

    if (usuario.roles?.length) {
      const rolActivo = usuario.roles.find(
        (rol: Role) =>
          Number(rol.idRole) ===
          Number(usuario.roleActiveIdRole)
      );

      this.rolSeleccionado = Number(
        rolActivo?.idRole ?? usuario.roles[0].idRole
      );
    }

    // Conservamos los valores guardados, incluyendo
    // cualquier selección manual de inspectoría.
    this.cargarSeleccionGuardada();

    this.mostrarModal = true;
  }

  verUsuario(usuario: any): void {
    this.editarUsuario(usuario);

    this.modoEdicion = false;
    this.modoSoloLectura = true;
  }

  // =========================
  // BUSCAR CIP PARA REGISTRO
  // =========================

  onCipInput(): void {
    if (this.modoSoloLectura) return;

    this.cip = this.cip
      .replace(/\D/g, '')
      .slice(0, 9);

    if (this.modoEdicion) return;

    this.buscandoCip = false;
    this.limpiarDatosPersona();

    if (this.cip.length === 9) {
      this.buscarPorCip();
    }
  }

  buscarPorCip(): void {
    if (this.modoSoloLectura || this.modoEdicion) return;

    const cipLimpio = this.cip.trim();

    if (!cipLimpio) return;

    if (cipLimpio.length !== 9) {
      void Swal.fire({
        icon: 'warning',
        title: 'CIP inválido',
        text: 'El CIP debe contener 9 caracteres.'
      });
      return;
    }

    if (this.buscandoCip) return;
    this.buscandoCip = true;

    this.usersService
      .getByCip(cipLimpio)
      .pipe(
        takeUntil(this.modalCerrado$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (persona: any) => {
          if (this.cip.trim() !== cipLimpio) return;
          this.username = persona?.chasqui ?? '';
          this.grado = persona?.gradoNombre ?? '';
          this.arma = persona?.armaNombre ?? '';

          this.fullname = [
            persona?.apellidoPaterno,
            persona?.apellidoMaterno,
            persona?.nombres
          ]
            .filter(Boolean)
            .join(' ');

          this.nucleoCodigo = String(persona?.nucleoCodigo ?? '').trim();
          this.brigadaCodigo = String(persona?.brigadaCodigo ?? '').trim();
          this.unidadCodigo = String(persona?.unidadCodigo ?? '').trim();
          this.nucleoNombre = persona?.nucleoNombre ?? '';
          this.brigadaNombre = persona?.brigadaNombre ?? '';
          this.unidadNombre = persona?.unidadNombre ?? '';
          this.cargarSeleccionGuardada(() => {
            if (this.cip.trim() !== cipLimpio || !this.unidadCodigo) return;
            this.onUnidadChange();
          });
          this.buscandoCip = false;

          if (!this.username) {
            void Swal.fire({
              icon: 'warning',
              title: 'Sin usuario Chasqui',
              text:
                'La persona fue encontrada, pero no tiene ' +
                'usuario Chasqui registrado.'
            });
          }
        },
        error: () => {
          if (this.cip.trim() !== cipLimpio) return;
          this.buscandoCip = false;
          this.limpiarDatosPersona();

          void Swal.fire({
            icon: 'error',
            title: 'No encontrado',
            text: 'No se encontró una persona con ese CIP.'
          });
        }
      });
  }

  // =========================
  // GUARDAR
  // =========================

  guardarUsuario(): void {
    if (this.modoSoloLectura) return;

    if (
      Number(this.rolSeleccionado) === 1 &&
      !this.administradorActual
    ) {
      void Swal.fire({
        icon: 'warning',
        title: 'Rol no permitido',
        text: 'Administrador no está disponible para asignación.'
      });
      return;
    }

    if (!/^\d{9}$/.test(this.cip)) {
      void Swal.fire({
        icon: 'warning',
        title: 'Falta CIP',
        text: 'Ingrese un CIP de 9 dígitos.'
      });
      return;
    }

    if (!this.username) {
      void Swal.fire({
        icon: 'warning',
        title: 'Usuario no válido',
        text: 'Primero busque un CIP válido.'
      });
      return;
    }

    if (!this.rolSeleccionado) {
      void Swal.fire({
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

      idNucleo: this.nucleoCodigo,
      idBrigada: this.brigadaCodigo,
      idUnidad: this.unidadCodigo,

      idNucleoIg: this.nucleoIgCodigo || null,
      idIg: this.igCodigo || null,

      roleActiveIdRole: this.rolSeleccionado
    };

    // El administrador existente conserva todos sus roles.
    const idsRoles = this.administradorActual
      ? this.usuarioActual.roles.map(
          (rol: Role) => Number(rol.idRole)
        )
      : [Number(this.rolSeleccionado)];

    void Swal.fire({
      title: this.modoEdicion
        ? 'Actualizando usuario...'
        : 'Registrando usuario...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    if (this.modoEdicion && this.userIdEditar !== null) {
      this.usersService
        .updateUser(
          this.userIdEditar,
          usuario,
          idsRoles
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            void Swal.fire({
              icon: 'success',
              title: 'Usuario actualizado',
              confirmButtonText: 'Aceptar'
            });

            this.cerrarModal();
            this.cargarUsuarios();
          },
          error: () => {
            void Swal.fire({
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
          idsRoles
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            void Swal.fire({
              icon: 'success',
              title: 'Usuario registrado',
              text: 'El usuario fue registrado correctamente.',
              confirmButtonText: 'Aceptar'
            });

            this.cerrarModal();
            this.cargarUsuarios();
          },
          error: err => {
            void Swal.fire({
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

  // =========================
  // ELIMINAR
  // =========================

  eliminarUsuario(usuario: any): void {
    void Swal.fire({
      icon: 'warning',
      title: '¿Eliminar usuario?',
      text: `Se eliminará a ${usuario.username}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c62828'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.usersService
        .eliminarUsuario(
          String(usuario.idUser)
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            void Swal.fire({
              icon: 'success',
              title: 'Usuario eliminado',
              confirmButtonText: 'Aceptar'
            });

            this.cargarUsuarios();
          },
          error: err => {
            void Swal.fire({
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

  // =========================
  // HELPERS
  // =========================

  obtenerRol(usuario: any): string {
    if (!usuario?.roles?.length) {
      return 'SIN ROL';
    }

    return usuario.roles
      .map(
        (rol: any) => rol.name ?? rol.nombre ?? ''
      )
      .filter(Boolean)
      .join(', ');
  }

  limpiarFormulario(): void {
    this.limpiarInspectoria();

    this.modoSoloLectura = false;
    this.modoEdicion = false;

    this.usuarioActual = null;
    this.userIdEditar = null;

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

    this.brigadas = [];
    this.unidades = [];

    this.rolSeleccionado = null;

    this.errorCatalogos = '';
    this.buscandoCip = false;
  }

  limpiarDatosPersona(): void {
    this.limpiarInspectoria();

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