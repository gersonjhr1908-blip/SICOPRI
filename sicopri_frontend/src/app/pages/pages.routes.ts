import { Routes } from '@angular/router';

import { certGuard } from '../guard/cert.guard';

import {
  DashboardComponent
} from './dashboard/dashboard.component';

import {
  Not403Component
} from './not403/not403.component';

import {
  MantoComponent
} from './manto/manto.component';

import {
  RegisterComponent
} from './manto/register/register.component';

import {
  AdminRolesMenuComponent
} from './admin-roles-menu/admin-roles-menu.component';


// =====================================================
// ADMIN / GENERALES
// =====================================================

import {
  TotalRegComponent
} from './total-reg/total-reg.component';

import {
  EstNvl3Component
} from './est-nvl-3/est-nvl-3.component';

import {
  EstNvl4Component
} from './est-nvl-4/est-nvl-4.component';

import {
  UsuariosComponent
} from './usuarios/usuarios.component';

import {
  MantenimientoComponent
} from './mantenimiento/mantenimiento.component';

import {
  ManualComponent
} from './manual/manual.component';


// =====================================================
// QRD NIVEL 2
// =====================================================

import {
  InicioQrdComponent
} from './qrd2-total/inicio-qrd/inicio-qrd.component';

import {
  RegistrarComponent
} from './qrd2-total/registrar/registrar.component';

import {
  PendientesComponent
} from './qrd2-total/pendiente-qrd/pendientes.component';

import {
  ListadoTotalComponent
} from './qrd2-total/listado-total/listado-total.component';

import {
  EstadisticaQrdComponent
} from './qrd2-total/estadistica-qrd/estadistica-qrd.component';

import {
  ManualQrdComponent
} from './qrd2-total/manual-qrd/manual-qrd.component';


// =====================================================
// QRD NIVEL 3
// =====================================================

import {
  InicioQrd3Component
} from './qrd-nivel3-total/inicio-qrd3/inicio-qrd3.component';

import {
  RegistroQrd3Component
} from './qrd-nivel3-total/registro-qrd3/registro-qrd3.component';

import {
  PendientesQrd3Component
} from './qrd-nivel3-total/pendientes-qrd3/pendientes-qrd3.component';

import {
  ListadoQrd3Component
} from './qrd-nivel3-total/listado-qrd3/listado-qrd3.component';

import {
  EstadisticaQrd3Component
} from './qrd-nivel3-total/estadistica-qrd3/estadistica-qrd3.component';

import {
  ManualQrd3Component
} from './qrd-nivel3-total/manual-qrd3/manual-qrd3.component';


// =====================================================
// QRD NIVEL 4
// =====================================================

import {
  InicioQrd4Component
} from './qrd-nivel4-total/inicio-qrd4/inicio-qrd4.component';

import {
  RegistroQrd4Component
} from './qrd-nivel4-total/registro-qrd4/registro-qrd4.component';

import {
  PendientesQrd4Component
} from './qrd-nivel4-total/pendientes-qrd4/pendientes-qrd4.component';

import {
  ListadoQrd4Component
} from './qrd-nivel4-total/listado-qrd4/listado-qrd4.component';

import {
  EstadisticaQrd4Component
} from './qrd-nivel4-total/estadistica-qrd4/estadistica-qrd4.component';

import {
  ManualQrd4Component
} from './qrd-nivel4-total/manual-qrd4/manual-qrd4.component';


// =====================================================
// INTEGRIDAD
// =====================================================

import {
  RegistrarIntegridadComponent
} from './integridad/registrar-integridad/registrar-integridad.component';

import {
  PendientesIntegridadComponent
} from './integridad/pendientes-integridad/pendientes-integridad.component';


// =====================================================
// ROUTES
// =====================================================

export const pagesRoutes: Routes = [


  // ===================================================
  // REDIRECCIÓN INICIAL
  // ===================================================

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },


  // ===================================================
  // HOME GENERAL / ADMIN
  // ===================================================

  {
    path: 'home',
    component: DashboardComponent,
    canActivate: [certGuard]
  },


  // ===================================================
  // QRD NIVEL 2 - ROL 3
  // ===================================================

  {
    path: 'qrd2/inicio',
    component: InicioQrdComponent,
    canActivate: [certGuard]
  },

  {
    path: 'qrd2/registrar',
    component: RegistrarComponent,
    canActivate: [certGuard]
  },

  {
    path: 'qrd2/pendientes',
    component: PendientesComponent,
    canActivate: [certGuard]
  },

  {
    path: 'qrd2/listado',
    component: ListadoTotalComponent,
    canActivate: [certGuard]
  },

  {
    path: 'qrd2/estadistica',
    component: EstadisticaQrdComponent,
    canActivate: [certGuard]
  },

  {
    path: 'qrd2/manual',
    component: ManualQrdComponent,
    canActivate: [certGuard]
  },


  // ===================================================
  // QRD NIVEL 3 - ROL 5
  // ===================================================

  {
    path: 'qrd3/inicio',
    component: InicioQrd3Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd3/registrar',
    component: RegistroQrd3Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd3/pendientes',
    component: PendientesQrd3Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd3/listado',
    component: ListadoQrd3Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd3/estadistica',
    component: EstadisticaQrd3Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd3/manual',
    component: ManualQrd3Component,
    canActivate: [certGuard]
  },


  // ===================================================
  // QRD NIVEL 4 - ROL 7
  // ===================================================

  {
    path: 'qrd4/inicio',
    component: InicioQrd4Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd4/registrar',
    component: RegistroQrd4Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd4/pendientes',
    component: PendientesQrd4Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd4/listado',
    component: ListadoQrd4Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd4/estadistica',
    component: EstadisticaQrd4Component,
    canActivate: [certGuard]
  },

  {
    path: 'qrd4/manual',
    component: ManualQrd4Component,
    canActivate: [certGuard]
  },


  // ===================================================
  // INTEGRIDAD
  // ===================================================

  {
    path: 'integridad/registrar',
    component: RegistrarIntegridadComponent,
    canActivate: [certGuard]
  },

  {
    path: 'integridad/pendientes',
    component: PendientesIntegridadComponent,
    canActivate: [certGuard]
  },


  // ===================================================
  // ADMINISTRADOR
  // ===================================================

  {
    path: 'total-reg',
    component: TotalRegComponent,
    canActivate: [certGuard]
  },

  {
    path: 'est-nvl-3',
    component: EstNvl3Component,
    canActivate: [certGuard]
  },

  {
    path: 'est-nvl-4',
    component: EstNvl4Component,
    canActivate: [certGuard]
  },

  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [certGuard]
  },

  {
    path: 'mantenimiento',
    component: MantenimientoComponent,
    canActivate: [certGuard]
  },


  // ===================================================
  // MANUAL GENERAL
  // ===================================================

  {
    path: 'manual',
    component: ManualComponent,
    canActivate: [certGuard]
  },


  // ===================================================
  // ROLES Y MENÚS
  // ===================================================

  {
    path: 'admin-roles-menu',
    component: AdminRolesMenuComponent,
    canActivate: [certGuard]
  },


  // ===================================================
  // MANTO
  // ===================================================

  {
    path: 'manto',
    component: MantoComponent,

    children: [

      {
        path: 'register',
        component: RegisterComponent
      }

    ],

    canActivate: [certGuard]
  },


  // ===================================================
  // SIN PERMISOS
  // ===================================================

  {
    path: 'not-403',
    component: Not403Component
  }

];
