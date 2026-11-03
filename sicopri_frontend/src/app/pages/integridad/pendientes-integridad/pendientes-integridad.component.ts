import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

import {
  Subject,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';

import Swal from 'sweetalert2';

import { IntegridadService } from '../../../services/integridad.service';

import { ExpedienteService } from '../../../services/expediente.service';

import { GestionarCasoIntegridadComponent } from './gestionar-caso-integridad/gestionar-caso-integridad.component';

import { EditarDocumentoIntegridadComponent } from './editar-documento-integridad/editar-documento-integridad.component';

@Component({
  selector: 'app-pendientes-integridad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarCasoIntegridadComponent,
    EditarDocumentoIntegridadComponent,
  ],
  templateUrl: './pendientes-integridad.component.html',
  styleUrl: './pendientes-integridad.component.css',
})
export class PendientesIntegridadComponent implements OnInit, OnDestroy {
  search = '';

  documentos: any[] = [];
  documentosOriginales: any[] = [];

  cargando = false;
  error = '';

  menuAbiertoId: number | null = null;

  mostrarGestion = false;
  documentoGestion: any = null;

  mostrarEditar = false;
  documentoEditar: any = null;

  eliminando = false;

  private readonly destroy$ = new Subject<void>();
  private readonly recarga$ = new Subject<void>();

  constructor(
    private expedienteService: ExpedienteService,
    private integridadService: IntegridadService,
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.recarga$.next();
    this.recarga$.complete();

    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  cerrarMenu(): void {
    this.menuAbiertoId = null;
  }

  @HostListener('document:keydown.escape')
  cerrarMenuConEscape(): void {
    this.menuAbiertoId = null;
  }

  cargarDocumentos(): void {
    this.recarga$.next();

    this.cargando = true;
    this.error = '';
    this.menuAbiertoId = null;

    this.expedienteService
      .listarExpedientes()
      .pipe(
        switchMap((data: any[]) => {
          const recibidos = (data || []).filter(
            (exp) =>
              String(exp.activo || '')
                .trim()
                .toUpperCase() === 'S' &&
              String(exp.categoria || '')
                .trim()
                .toUpperCase() === 'INTEGRIDAD' &&
              Number(exp.nivelActual) === 2 &&
              [2, 3, 4].includes(Number(exp.idEstado)),
          );

          if (!recibidos.length) {
            return of([]);
          }

          return forkJoin(
            recibidos.map((exp) =>
              this.integridadService
                .obtenerDetalle(Number(exp.idExpediente))
                .pipe(
                  map((detalle) => ({
                    ...exp,
                    ...detalle,
                    estadoVisual: this.obtenerEstado(exp.idEstado),
                    errorDetalle: false,
                  })),
                  catchError(() =>
                    of({
                      ...exp,
                      estadoVisual: this.obtenerEstado(exp.idEstado),
                      errorDetalle: true,
                    }),
                  ),
                ),
            ),
          );
        }),
        takeUntil(this.recarga$),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (data) => {
          this.documentosOriginales = [...(data || [])].sort(
            (a, b) => Number(b.idExpediente) - Number(a.idExpediente),
          );

          this.buscarDocumentos();
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          this.error = 'No se pudieron cargar las denuncias pendientes.';
          this.documentos = [];
          this.documentosOriginales = [];
        },
      });
  }

  private obtenerEstado(estado: any): string {
    switch (Number(estado)) {
      case 3:
        return 'OBSERVADO';
      case 4:
        return 'CONCLUIDO';
      default:
        return 'PENDIENTE';
    }
  }

  puedeEditarEliminar(documento: any): boolean {
    return (
      Number(documento.nivelActual) === 2 && Number(documento.idEstado) === 3
    );
  }

  buscarDocumentos(): void {
    const texto = this.search.trim().toLowerCase();

    this.documentos = this.documentosOriginales.filter((doc) =>
      [
        doc.cinv,
        doc.nroDocumento,
        this.obtenerMotivo(doc.motivoDenuncia),
        doc.detalle,
        doc.detalleOtros,
      ].some((valor) =>
        String(valor || '')
          .toLowerCase()
          .includes(texto),
      ),
    );

    this.menuAbiertoId = null;
  }

  limpiarBusqueda(): void {
    this.search = '';
    this.buscarDocumentos();
  }

  toggleMenu(documento: any, event: MouseEvent): void {
    event.stopPropagation();

    const id = Number(documento.idExpediente);

    this.menuAbiertoId = this.menuAbiertoId === id ? null : id;
  }

  gestionar(documento: any): void {
    this.menuAbiertoId = null;
    this.documentoGestion = documento;
    this.mostrarGestion = true;
  }

  cerrarGestion(): void {
    this.mostrarGestion = false;
    this.documentoGestion = null;
    this.cargarDocumentos();
  }

  documentoEnviado(): void {
    this.mostrarGestion = false;
    this.documentoGestion = null;
    this.cargarDocumentos();
  }

  editar(documento: any): void {
    if (!this.puedeEditarEliminar(documento)) {
      return;
    }

    this.menuAbiertoId = null;
    this.documentoEditar = documento;
    this.mostrarEditar = true;
  }

  cerrarEditar(): void {
    this.mostrarEditar = false;
    this.documentoEditar = null;
    this.cargarDocumentos();
  }

  documentoActualizado(): void {
    this.mostrarEditar = false;
    this.documentoEditar = null;
    this.cargarDocumentos();
  }

  async eliminar(documento: any): Promise<void> {
    if (this.eliminando || !this.puedeEditarEliminar(documento)) {
      return;
    }

    this.menuAbiertoId = null;
    this.eliminando = true;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar denuncia observada?',
      text: `Se retirará ${documento.cinv} del listado activo.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });

    if (!resultado.isConfirmed) {
      this.eliminando = false;
      return;
    }

    this.integridadService
      .eliminarDenuncia(Number(documento.idExpediente))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.eliminando = false;
          this.cargarDocumentos();

          void Swal.fire({
            icon: 'success',
            title: 'Denuncia eliminada',
            text: 'La denuncia fue retirada del listado activo.',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (err: any) => {
          this.eliminando = false;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text:
              typeof err?.error?.message === 'string'
                ? err.error.message
                : 'No se pudo eliminar la denuncia.',
          });
        },
      });
  }

  obtenerMotivo(motivo: any): string {
    const motivos: Record<string, string> = {
      APROPIACION:
        'Apropiación o uso indebido de recursos, bienes o información del Estado.',
      FAVORECIMIENTO: 'Favorecimiento indebido.',
      VENTAJAS: 'Acceso a ventajas indebidas.',
      INFLUENCIAS: 'Invocación de influencias en el Estado.',
      CONFLICTO: 'Mantener intereses en conflicto.',
      OBSTRUCCION: 'Obstrucción al acceso a la información pública.',
      AUTORIDAD: 'Abuso de autoridad.',
      OTROS: 'Otros.',
    };

    return motivos[String(motivo)] || motivo || '-';
  }

  archivando = false;

  async archivar(documento: any): Promise<void> {
    if (
      this.archivando ||
      this.eliminando ||
      Number(documento.nivelActual) !== 2 ||
      Number(documento.idEstado) !== 4
    ) {
      return;
    }

    this.menuAbiertoId = null;
    this.archivando = true;

    const resultado = await Swal.fire({
      icon: 'question',
      title: '¿Archivar denuncia?',
      text: `${documento.cinv} dejará de aparecer en Pendientes y quedará archivado en Listado Total.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, archivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#145c43',
    });

    if (!resultado.isConfirmed) {
      this.archivando = false;
      return;
    }

    this.integridadService
      .archivarDenuncia(Number(documento.idExpediente))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.archivando = false;
          this.cargarDocumentos();

          void Swal.fire({
            icon: 'success',
            title: 'Denuncia archivada',
            text: 'El caso fue archivado correctamente.',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (error: any) => {
          this.archivando = false;

          console.error('ERROR AL ARCHIVAR INTEGRIDAD:', error);

          const cuerpo = error?.error;

          const mensaje =
            typeof cuerpo?.message === 'string'
              ? cuerpo.message
              : typeof cuerpo?.mensaje === 'string'
                ? cuerpo.mensaje
                : typeof cuerpo === 'string' && cuerpo.trim()
                  ? cuerpo
                  : 'Revise la consola del backend para identificar la causa.';

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo archivar',
            text: `HTTP ${error?.status ?? '-'}: ${mensaje}`,
            confirmButtonText: 'Aceptar',
          });
        },
      });
  }
}
