import { CommonModule } from '@angular/common';

import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject, takeUntil } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { UsersService } from '../../services/users.service';

type ModuloInicio = 'qrd' | 'integridad' | 'administrador';
type NivelInicio = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-inicio-compartido',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio-compartido.component.html',
  styleUrl: './inicio-compartido.component.css',
})
export class InicioCompartidoComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  modulo: ModuloInicio = 'qrd';

  @Input({ required: true })
  nivel: NivelInicio = 2;

  nombreUsuario = '';

  private readonly destroy$ = new Subject<void>();

  get accesos() {
    if (this.modulo === 'administrador') {
      return [
        {
          titulo: 'Usuarios',
          descripcion: 'Consulta y administra los usuarios del sistema.',
          ruta: 'usuarios',
          icono:
            'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M17 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87',
        },
        {
          titulo: 'Roles y menús',
          descripcion: 'Gestiona la configuración de roles y sus menús.',
          ruta: 'admin-roles-menu',
          icono: 'M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4zm-4 10 3 3 5-6',
        },
        {
          titulo: 'Mantenimiento',
          descripcion: 'Accede a las opciones de mantenimiento del sistema.',
          ruta: 'mantenimiento',
          icono: 'M14 6a5 5 0 0 0-6 6L2 18l4 4 6-6a5 5 0 0 0 6-6l-3 3-4-4 3-3z',
        },
      ];
    }

    return [
      {
        titulo: 'Pendientes',
        descripcion:
          'Revisa y gestiona los expedientes pendientes de atención.',
        ruta: 'pendientes',
        icono: 'M3 8l9-5 9 5-9 5-9-5zm0 5 9 5 9-5M3 18l9 5 9-5',
      },
      {
        titulo: 'Listado total',
        descripcion:
          'Consulta el registro y el seguimiento de tus expedientes.',
        ruta: 'listado',
        icono: 'M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01',
      },
      {
        titulo: 'Manual de usuario',
        descripcion:
          'Accede a la guía de uso del sistema y sus funcionalidades.',
        ruta: 'manual',
        icono:
          'M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1zm0 0v15',
      },
    ];
  }

  constructor(private usersService: UsersService) {}

  get titulo(): string {
    if (this.modulo === 'administrador') {
      return 'ADMINISTRACIÓN DEL SISTEMA SICOPRI';
    }

    if (this.modulo === 'integridad') {
      return this.nivel === 2
        ? 'DEPARTAMENTO DE DENUNCIAS ANTICORRUPTIVAS'
        : 'INSPECTORÍA DE INTEGRIDAD';
    }

    return this.nivel === 2
      ? 'DEPARTAMENTO DE RECLAMOS, QUEJAS Y DENUNCIAS'
      : 'INSPECTORÍA DE RECLAMOS, QUEJAS Y DENUNCIAS';
  }

  get etiqueta(): string {
    if (this.modulo === 'administrador') {
      return 'ADMINISTRADOR';
    }

    const modulo = this.modulo === 'qrd' ? 'RQD' : 'INTEGRIDAD';

    return `${modulo} · NIVEL ${this.nivel}`;
  }

  get rutaBase(): string {
    if (this.modulo === 'administrador') {
      return '/pages';
    }

    const segmento =
      this.modulo === 'qrd'
        ? `qrd${this.nivel}`
        : this.nivel === 2
          ? 'integridad'
          : `integridad${this.nivel}`;

    return `/pages/${segmento}`;
  }

  ngOnInit(): void {
    const token = sessionStorage.getItem(environment.TOKEN_NAME);

    if (!token) {
      return;
    }

    let username = '';

    try {
      const contenido = new JwtHelperService().decodeToken(token);

      username = typeof contenido?.sub === 'string' ? contenido.sub.trim() : '';
    } catch {
      return;
    }

    if (!username) {
      return;
    }

    this.nombreUsuario = username;

    this.usersService
      .getByUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          this.nombreUsuario = usuario?.fullname?.trim() || username;
        },
        error: () => {
          this.nombreUsuario = username;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
