import { Component, OnInit, OnDestroy } from '@angular/core';

import { MaterialModule } from '../../material/material.module';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';

import { NgIf, NgFor } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Menu } from '../../model/menu';

import { MenuService } from '../../services/menu.service';

import { LoginService } from '../../services/login.service';

import { FooterComponent } from '../footer/footer.component';

import { UsersService } from '../../services/users.service';

import { environment } from '../../../environments/environment.development';

import { JwtHelperService } from '@auth0/angular-jwt';

import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [
    MaterialModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    FooterComponent,
    NgIf,
    NgFor,
    FormsModule,
  ],

  templateUrl: './layout.component.html',

  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  // =========================================
  // MENÚ
  // =========================================

  selectedMenu: string = '';

  menus: Menu[] = [];

  // =========================================
  // USUARIO
  // =========================================

  username: string = '';

  roleNameUser: string = '';

  roleNameActivo: string = '';

  // =========================================
  // CAMBIO DE VISTA DE ROL
  // =========================================

  esAdministrador: boolean = false;

  rolActivoId: number = 1;

  rolesVista = [
    {
      id: 1,
      nombre: 'Administrador',
    },

    {
      id: 2,
      nombre: 'Integridad - Nivel 2',
    },

    {
      id: 3,
      nombre: 'QRD - Nivel 2',
    },

    {
      id: 4,
      nombre: 'INSP. Integridad - Nivel 3',
    },

    {
      id: 5,
      nombre: 'INSP. QRD - Nivel 3',
    },

    {
      id: 6,
      nombre: 'INSP. Integridad - Nivel 4',
    },

    {
      id: 7,
      nombre: 'INSP. QRD - Nivel 4',
    },
  ];

  private destroy$ = new Subject<void>();

  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private menuService: MenuService,

    private loginService: LoginService,

    private userService: UsersService,

    private router: Router,
  ) {}

  // =========================================
  // INICIO
  // =========================================

  ngOnInit(): void {
    // =========================================
    // ESCUCHAR CAMBIOS DEL MENÚ
    // =========================================

    this.menuService
      .getMenuChange()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.menus = data || [];
        },

        error: (error) => {
          console.error('Error al cargar el menú:', error);

          this.menus = [];
        },
      });

    // =========================================
    // RESTAURAR MENÚ SELECCIONADO
    // =========================================

    const savedMenu = sessionStorage.getItem('selectedMenu');

    if (savedMenu) {
      this.selectedMenu = savedMenu;
    }

    // =========================================
    // CARGAR DATOS DEL USUARIO
    // =========================================

    this.loadUserInfo();
  }

  // =========================================
  // DESTRUIR SUSCRIPCIONES
  // =========================================

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }

  // =========================================
  // INFORMACIÓN DEL USUARIO
  // =========================================

  private loadUserInfo(): void {
    try {
      const helper = new JwtHelperService();

      const token = sessionStorage.getItem(environment.TOKEN_NAME);

      if (!token) {
        console.error('No se encontró token en sessionStorage');

        return;
      }

      const decodedToken = helper.decodeToken(token);

      if (!decodedToken || !decodedToken.sub) {
        console.error('Token inválido o sin subject');

        return;
      }

      const usernameFromToken = decodedToken.sub;

      this.userService
        .getByUsername(usernameFromToken)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (!response) {
              return;
            }

            // =====================================
            // USERNAME
            // =====================================

            this.username = (response as any).username || usernameFromToken;

            // =====================================
            // ROLES REALES
            // =====================================

            const rolesArray = Array.isArray((response as any).roles)
              ? (response as any).roles
              : [];

            if (rolesArray.length > 0 && rolesArray[0]?.name) {
              this.roleNameUser = rolesArray[0].name;
            }

            // =====================================
            // ¿ADMINISTRADOR REAL?
            // =====================================

            this.esAdministrador = rolesArray.some(
              (rol: any) => Number(rol.idRole) === 1,
            );

            // =====================================
            // ROL ACTIVO
            // =====================================

            if ((response as any).roleActiveIdRole) {
              this.rolActivoId = Number((response as any).roleActiveIdRole);
            } else {
              this.rolActivoId = 1;
            }

            // =====================================
            // TEXTO DEL ROL ACTIVO
            // =====================================

            const rolVistaActual = this.rolesVista.find(
              (rol) => rol.id === this.rolActivoId,
            );

            this.roleNameActivo = rolVistaActual
              ? rolVistaActual.nombre
              : 'Administrador';

            this.cargarMenusUsuario();

            const rutaActual = this.router.url.split(/[?#]/)[0];

            if (
              rutaActual === '/pages/home' ||
              rutaActual === '/pages' ||
              rutaActual === '/pages/'
            ) {
              const inicio = this.obtenerRutaInicioPorRol();

              this.selectedMenu = inicio;

              sessionStorage.setItem('selectedMenu', inicio);

              if (rutaActual !== inicio) {
                void this.router.navigateByUrl(inicio, { replaceUrl: true });
              }
            }
          },

          error: (error) => {
            console.error('Error al cargar información del usuario:', error);

            this.username = usernameFromToken;
          },
        });
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
  }

  // =========================================
  // CAMBIAR VISTA DE ROL
  // SOLO ADMINISTRADOR
  // =========================================

  cambiarVistaRol(idRol: number): void {
    if (!this.esAdministrador) {
      return;
    }

    if (!idRol) {
      return;
    }

    this.userService.cambiarRolActivo(idRol).subscribe({
      next: () => {
        this.rolActivoId = Number(idRol);

        const rolSeleccionado = this.rolesVista.find(
          (rol) => rol.id === this.rolActivoId,
        );

        if (rolSeleccionado) {
          this.roleNameActivo = rolSeleccionado.nombre;
        }

        // =====================================
        // RECARGAR MENÚ SEGÚN ROL ACTIVO
        // =====================================

        this.menuService.getMenusByUser(this.username).subscribe({
          next: (menus) => {
            this.menus = menus || [];

            this.menuService.setMenuChange(menus || []);

            // =================================
            // IR AL INICIO CORRECTO DEL ROL
            // =================================

            const inicio = this.obtenerRutaInicioPorRol();

            this.selectedMenu = inicio;

            sessionStorage.setItem('selectedMenu', inicio);

            this.router.navigate([inicio]);
          },

          error: (error) => {
            console.error('Error al recargar menú:', error);
          },
        });
      },

      error: (error) => {
        console.error('Error al cambiar vista de rol:', error);
      },
    });
  }

  private cargarMenusUsuario(): void {
    if (!this.username) {
      return;
    }

    this.menuService
      .getMenusByUser(this.username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (menus) => {
          this.menuService.setMenuChange(menus || []);
        },
        error: (error) => {
          console.error('Error al cargar los menús del usuario:', error);

          this.menus = [];
        },
      });
  }

  // =========================================
  // RUTA INICIO POR ROL
  // =========================================

  private obtenerRutaInicioPorRol(): string {
    switch (this.rolActivoId) {
      // INTEGRIDAD NIVEL 2
      case 2:
        return '/pages/integridad/inicio';

      // QRD NIVEL 2
      case 3:
        return '/pages/qrd2/inicio';

      // INTEGRIDAD NIVEL 3
      case 4:
        return '/pages/integridad3/inicio';

      // QRD NIVEL 3
      case 5:
        return '/pages/qrd3/inicio';

      // INTEGRIDAD NIVEL 4
      case 6:
        return '/pages/integridad4/inicio';

      // QRD NIVEL 4
      case 7:
        return '/pages/qrd4/inicio';

      // ADMINISTRADOR
      default:
        return '/pages/home';
    }
  }

  // =========================================
  // OBTENER URL SEGÚN ROL ACTIVO
  // =========================================

  getMenuUrl(menuItem: Menu): string {
    const nombreMenu = String(menuItem.name || '')
      .trim()
      .toUpperCase();

    // =========================================
    // INTEGRIDAD NIVEL 2
    // ROL 2
    // =========================================

    if (this.rolActivoId === 2) {
      switch (nombreMenu) {
        case 'INICIO':
          return '/pages/integridad/inicio';

        case 'REGISTRAR':
          return '/pages/integridad/registrar';

        case 'PENDIENTES':
          return '/pages/integridad/pendientes';

        case 'LISTADO TOTAL':
          return '/pages/integridad/listado';

        case 'ESTADISTICA':
        case 'ESTADÍSTICA':
          return '/pages/integridad/estadistica';

        case 'MANUAL':
          return '/pages/integridad/manual';

        default:
          return menuItem.url;
      }
    }

    // =========================================
    // QRD NIVEL 2
    // ROL 3
    // =========================================

    if (this.rolActivoId === 3) {
      switch (nombreMenu) {
        case 'INICIO':
          return '/pages/qrd2/inicio';

        case 'REGISTRAR':
          return '/pages/qrd2/registrar';

        case 'PENDIENTES':
          return '/pages/qrd2/pendientes';

        case 'LISTADO TOTAL':
          return '/pages/qrd2/listado';

        case 'ESTADISTICA':
        case 'ESTADÍSTICA':
          return '/pages/qrd2/estadistica';

        case 'MANUAL':
          return '/pages/qrd2/manual';

        default:
          return menuItem.url;
      }
    }

    // =========================================
    // INTEGRIDAD NIVEL 3
    // ROL 4
    // =========================================

    if (this.rolActivoId === 4) {
      switch (nombreMenu) {
        case 'INICIO':
          return '/pages/integridad3/inicio';

        case 'PENDIENTES':
          return '/pages/integridad3/pendientes';

        case 'LISTADO TOTAL':
          return '/pages/integridad3/listado';

        case 'ESTADISTICA':
        case 'ESTADÍSTICA':
          return '/pages/integridad3/estadistica';

        case 'MANUAL':
          return '/pages/integridad3/manual';

        default:
          return menuItem.url;
      }
    }

    // =========================================
    // QRD NIVEL 3
    // ROL 5
    // =========================================

    if (this.rolActivoId === 5) {
      switch (nombreMenu) {
        case 'INICIO':
          return '/pages/qrd3/inicio';

        case 'REGISTRAR':
          return '/pages/qrd3/registrar';

        case 'PENDIENTES':
          return '/pages/qrd3/pendientes';

        case 'LISTADO TOTAL':
          return '/pages/qrd3/listado';

        case 'ESTADISTICA':
        case 'ESTADÍSTICA':
          return '/pages/qrd3/estadistica';

        case 'MANUAL':
          return '/pages/qrd3/manual';

        default:
          return menuItem.url;
      }
    }

    // =========================================
    // INTEGRIDAD NIVEL 4
    // ROL 6
    // =========================================

    if (this.rolActivoId === 6) {
      switch (nombreMenu) {
        case 'INICIO':
          return '/pages/integridad4/inicio';

        case 'PENDIENTES':
          return '/pages/integridad4/pendientes';

        case 'LISTADO TOTAL':
          return '/pages/integridad4/listado';

        case 'ESTADISTICA':
        case 'ESTADÍSTICA':
          return '/pages/integridad4/estadistica';

        case 'MANUAL':
          return '/pages/integridad4/manual';

        default:
          return menuItem.url;
      }
    }

    // =========================================
    // QRD NIVEL 4
    // ROL 7
    // =========================================

    if (this.rolActivoId === 7) {
      switch (nombreMenu) {
        case 'INICIO':
          return '/pages/qrd4/inicio';

        case 'REGISTRAR':
          return '/pages/qrd4/registrar';

        case 'PENDIENTES':
          return '/pages/qrd4/pendientes';

        case 'LISTADO TOTAL':
          return '/pages/qrd4/listado';

        case 'ESTADISTICA':
        case 'ESTADÍSTICA':
          return '/pages/qrd4/estadistica';

        case 'MANUAL':
          return '/pages/qrd4/manual';

        default:
          return menuItem.url;
      }
    }

    // =========================================
    // ADMINISTRADOR
    // =========================================

    return menuItem.url;
  }

  // =========================================
  // SELECCIONAR MENÚ
  // =========================================

  selectMenu(menuUrl: string): void {
    this.selectedMenu = menuUrl;

    sessionStorage.setItem('selectedMenu', menuUrl);
  }

  // =========================================
  // TRACK BY
  // =========================================

  trackByMenuId(index: number, menu: Menu): number {
    return menu.idMenu;
  }

  // =========================================
  // CERRAR SESIÓN
  // =========================================

  logout(): void {
    this.loginService.logout();
  }
}
