import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  Subject,
  catchError,
  firstValueFrom,
  forkJoin,
  map,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';

import Swal from 'sweetalert2';

import { ExpedienteService } from '../../../services/expediente.service';
import { IntegridadService } from '../../../services/integridad.service';

import { VerCasoIntegridadComponent } from '../registrar-integridad/ver-caso-integridad/ver-caso-integridad.component';

import { TrazabilidadPdfIntegridadComponent } from './trazabilidad-pdf-integridad/trazabilidad-pdf-integridad.component';

@Component({
  selector: 'app-listado-integridad-compartido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VerCasoIntegridadComponent,
    TrazabilidadPdfIntegridadComponent,
  ],
  templateUrl: './listado-integridad-compartido.component.html',
  styleUrl: './listado-integridad-compartido.component.css',
})
export class ListadoIntegridadCompartidoComponent implements OnInit, OnDestroy {
  @Input() nivel: 2 | 3 | 4 = 2;

  search = '';
  documentos: any[] = [];
  documentosOriginales: any[] = [];

  cargando = false;
  error = '';
  eliminando = false;

  menuAbiertoId: number | null = null;

  documentoSeleccionado: any = null;

  expedienteTrazabilidad: any = null;
  movimientos: any[] = [];
  cargandoTrazabilidad = false;
  errorTrazabilidad = '';
  expedientePdf: any = null;

  private destruido = false;

  private readonly destroy$ = new Subject<void>();
  private readonly recarga$ = new Subject<void>();
  private readonly cambioTrazabilidad$ = new Subject<void>();

  constructor(
    private expedienteService: ExpedienteService,
    private integridadService: IntegridadService,
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.destruido = true;

    this.recarga$.next();
    this.recarga$.complete();

    this.cambioTrazabilidad$.next();
    this.cambioTrazabilidad$.complete();

    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  cerrarMenu(): void {
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
          const candidatos = (data || []).filter(
            (exp: any) =>
              String(exp.activo ?? '')
                .trim()
                .toUpperCase() === 'S' &&
              String(exp.categoria ?? '')
                .trim()
                .toUpperCase() === 'INTEGRIDAD' &&
              [2, 3, 4, 5].includes(Number(exp.idEstado)),
          );

          if (!candidatos.length) {
            return of([]);
          }

          return forkJoin(
            candidatos.map((exp: any) => {
              const id = Number(exp.idExpediente);

              const detalle$ = this.integridadService.obtenerDetalle(id).pipe(
                map((detalle: any) => ({
                  ...exp,
                  ...detalle,
                  errorDetalle: false,
                })),
                catchError(() =>
                  of({
                    ...exp,
                    errorDetalle: true,
                  }),
                ),
              );

              const movimientos$ =
                this.nivel === 2
                  ? of([])
                  : this.expedienteService.listarMovimientos(id);

              return forkJoin({
                documento: detalle$,
                movimientos: movimientos$,
              }).pipe(
                map(({ documento, movimientos }) => {
                  const pasoPorNivel =
                    this.nivel === 2 ||
                    Number(documento.nivelActual) === this.nivel ||
                    (movimientos || []).some(
                      (movimiento: any) =>
                        Number(movimiento.nivelOrigen) === this.nivel ||
                        Number(movimiento.nivelDestino) === this.nivel,
                    );

                  return pasoPorNivel
                    ? {
                        ...documento,
                        estadoVisual: this.obtenerEstado(documento.idEstado),
                      }
                    : null;
                }),
              );
            }),
          );
        }),
        takeUntil(this.recarga$),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (data: any[]) => {
          this.documentosOriginales = (data || [])
            .filter((doc: any) => doc !== null)
            .sort(
              (a: any, b: any) =>
                Number(b.idExpediente) - Number(a.idExpediente),
            );

          this.buscarDocumentos();
          this.cargando = false;
        },
        error: (error: any) => {
          console.error('ERROR LISTADO INTEGRIDAD:', error);

          this.cargando = false;
          this.documentos = [];
          this.documentosOriginales = [];

          this.error =
            'No se pudo cargar el listado o consultar los movimientos.';
        },
      });
  }

  obtenerEstado(valor: any): string {
    const estados: Record<number, string> = {
      1: 'REGISTRADO',
      2: 'ENVIADO',
      3: 'OBSERVADO',
      4: 'CONCLUIDO',
      5: 'ARCHIVADO',
    };

    return estados[Number(valor)] || 'SIN ESTADO';
  }

  obtenerMotivo(valor: any): string {
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

    return motivos[String(valor)] || valor || '-';
  }

  buscarDocumentos(): void {
    const texto = this.search.trim().toLowerCase();

    this.documentos = this.documentosOriginales.filter((doc: any) =>
      [
        doc.cinv,
        doc.nroDocumento,
        this.obtenerMotivo(doc.motivoDenuncia),
        doc.detalle,
        doc.detalleOtros,
        doc.estadoVisual,
      ].some((valor: any) =>
        String(valor ?? '')
          .toLowerCase()
          .includes(texto),
      ),
    );

    this.cerrarMenu();
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

  verCaso(documento: any): void {
    this.cerrarMenu();
    this.documentoSeleccionado = documento;
  }

  cerrarVerCaso(): void {
    this.documentoSeleccionado = null;
  }

  puedeEliminar(documento: any): boolean {
    return (
      this.nivel === 2 &&
      Number(documento.idEstado) === 5 &&
      Number(documento.nivelActual) === 2
    );
  }

  async eliminar(documento: any): Promise<void> {
    if (this.eliminando || !this.puedeEliminar(documento)) {
      return;
    }

    this.cerrarMenu();
    this.eliminando = true;

    try {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar denuncia archivada?',
        text: `${documento.cinv} dejará de aparecer en los listados activos.`,
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b42318',
      });

      if (!resultado.isConfirmed || this.destruido) {
        return;
      }

      await firstValueFrom(
        this.integridadService.eliminarArchivada(
          Number(documento.idExpediente),
        ),
      );

      if (this.destruido) {
        return;
      }

      this.cargarDocumentos();

      void Swal.fire({
        icon: 'success',
        title: 'Denuncia eliminada',
        confirmButtonText: 'Aceptar',
      });
    } catch (error: any) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text: this.mensajeError(
            error,
            'No se pudo eliminar la denuncia archivada.',
          ),
        });
      }
    } finally {
      this.eliminando = false;
    }
  }

  abrirTrazabilidad(documento: any): void {
    this.cerrarMenu();
    this.cambioTrazabilidad$.next();

    this.expedienteTrazabilidad = documento;
    this.movimientos = [];
    this.cargandoTrazabilidad = true;
    this.errorTrazabilidad = '';

    this.expedienteService
      .listarMovimientos(Number(documento.idExpediente))
      .pipe(takeUntil(this.cambioTrazabilidad$), takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          this.movimientos = this.ordenarMovimientos(data);
          this.cargandoTrazabilidad = false;
        },
        error: (error: any) => {
          this.cargandoTrazabilidad = false;
          this.errorTrazabilidad = this.mensajeError(
            error,
            'No se pudo consultar la trazabilidad.',
          );
        },
      });
  }

  cerrarTrazabilidad(): void {
    this.cambioTrazabilidad$.next();
    this.expedienteTrazabilidad = null;
    this.movimientos = [];
    this.cargandoTrazabilidad = false;
    this.errorTrazabilidad = '';
  }

  nivelVisual(valor: any): string {
    const numero = Number(valor);

    return [2, 3, 4].includes(numero) ? `Integridad Nivel ${numero}` : '-';
  }

  private ordenarMovimientos(data: any[]): any[] {
    return [...(data || [])].sort((a: any, b: any) => {
      const fechaA = String(a.fechaMovimiento ?? '');
      const fechaB = String(b.fechaMovimiento ?? '');

      return (
        fechaA.localeCompare(fechaB) ||
        Number(a.idMovimiento ?? 0) - Number(b.idMovimiento ?? 0)
      );
    });
  }

  imprimirTrazabilidad(documento: any): void {
    this.cerrarMenu();
    this.expedientePdf = documento;
  }

  cerrarPdf(): void {
    this.expedientePdf = null;
  }

  private mensajeError(error: any, alternativo: string): string {
    const cuerpo = error?.error;

    if (typeof cuerpo?.message === 'string') {
      return cuerpo.message;
    }

    if (typeof cuerpo?.mensaje === 'string') {
      return cuerpo.mensaje;
    }

    return alternativo;
  }
}
