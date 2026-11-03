import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  Subject,
  catchError,
  firstValueFrom,
  forkJoin,
  map,
  of,
  switchMap,
  takeUntil
} from 'rxjs';

import Swal from 'sweetalert2';

import { ExpedienteService } from '../../../services/expediente.service';
import { IntegridadService } from '../../../services/integridad.service';

import {
  GestionarIntegridad4Component
} from './gestionar-integridad4/gestionar-integridad4.component';

import {
  RespuestaIntegridad4Component
} from './respuesta-integridad4/respuesta-integridad4.component';

@Component({
  selector: 'app-pendientes-integridad4',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarIntegridad4Component,
    RespuestaIntegridad4Component
  ],
  templateUrl: './pendientes-integridad4.component.html',
  styleUrl: './pendientes-integridad4.component.css'
})
export class PendientesIntegridad4Component
  implements OnInit, OnDestroy {

  search = '';

  documentos: any[] = [];
  documentosOriginales: any[] = [];

  cargando = false;
  error = '';
  menuAbiertoId: number | null = null;

  mostrarCaso = false;
  documentoSeleccionado: any = null;

  mostrarRespuesta = false;
  documentoRespuesta: any = null;
  iniciarRespuestaEnListado = false;

  respuestaGuardada = false;
  cargandoRespuestaCaso = false;
  errorRespuestaCaso = '';

  procesandoAccion = false;

  private destruido = false;

  private readonly destroy$ = new Subject<void>();
  private readonly recarga$ = new Subject<void>();
  private readonly cambioGestion$ = new Subject<void>();

  constructor(
    private expedienteService: ExpedienteService,
    private integridadService: IntegridadService
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.destruido = true;

    this.recarga$.next();
    this.recarga$.complete();

    this.cambioGestion$.next();
    this.cambioGestion$.complete();

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
          const recibidos = (data || []).filter((exp: any) =>
            String(exp.activo ?? '').trim().toUpperCase() === 'S' &&
            String(exp.categoria ?? '').trim().toUpperCase() === 'INTEGRIDAD' &&
            Number(exp.nivelActual) === 4 &&
            [2, 4].includes(Number(exp.idEstado))
          );

          if (!recibidos.length) {
            return of([]);
          }

          return forkJoin(
            recibidos.map((exp: any) =>
              this.integridadService
                .obtenerDetalle(Number(exp.idExpediente))
                .pipe(
                  map((detalle: any) => ({
                    ...exp,
                    ...detalle,
                    estadoVisual: this.obtenerEstado(detalle?.idEstado ?? exp.idEstado),
                    errorDetalle: false
                  })),
                  catchError(() => of({
                    ...exp,
                    estadoVisual: this.obtenerEstado(exp.idEstado),
                    errorDetalle: true
                  }))
                )
            )
          );
        }),
        takeUntil(this.recarga$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any[]) => {
          this.documentosOriginales = [...(data || [])].sort(
            (a: any, b: any) =>
              Number(b.idExpediente) - Number(a.idExpediente)
          );

          this.buscarDocumentos();
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
          this.documentos = [];
          this.documentosOriginales = [];
          this.error = 'No se pudieron cargar los pendientes de Integridad 4.';
        }
      });
  }

  obtenerEstado(valor: any): string {
    return Number(valor) === 4 ? 'CONCLUIDO' : 'PENDIENTE';
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
      OTROS: 'Otros.'
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
        doc.detalleOtros
      ].some((valor: any) =>
        String(valor ?? '').toLowerCase().includes(texto)
      )
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

    this.menuAbiertoId =
      this.menuAbiertoId === id ? null : id;
  }

  gestionar(documento: any): void {
    this.cambioGestion$.next();
    this.cerrarMenu();

    this.documentoSeleccionado = documento;
    this.respuestaGuardada = false;
    this.errorRespuestaCaso = '';
    this.mostrarCaso = true;

    this.consultarRespuestaCaso();
  }

  consultarRespuestaCaso(): void {
    const id = Number(this.documentoSeleccionado?.idExpediente);

    if (!id || this.cargandoRespuestaCaso) {
      return;
    }

    this.cargandoRespuestaCaso = true;
    this.errorRespuestaCaso = '';

    this.integridadService
      .listarRespuestasNivel4(id)
      .pipe(
        takeUntil(this.cambioGestion$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (respuestas: any[]) => {
          this.respuestaGuardada =
            Array.isArray(respuestas) && respuestas.length > 0;

          this.cargandoRespuestaCaso = false;
        },
        error: (error: any) => {
          this.cargandoRespuestaCaso = false;
          this.errorRespuestaCaso = this.mensajeError(
            error,
            'No se pudieron consultar las respuestas del caso.'
          );

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo consultar la respuesta',
            text: 'Cierre y vuelva a abrir Gestionar para reintentar.'
          });
        }
      });
  }

  abrirRespuesta(documento: any, verListado = false): void {
    if (
      this.procesandoAccion ||
      this.cargandoRespuestaCaso ||
      this.errorRespuestaCaso
    ) {
      return;
    }

    this.documentoRespuesta = documento;
    this.iniciarRespuestaEnListado = verListado;
    this.mostrarRespuesta = true;
  }

  actualizarRespuestas(respuestas: any[]): void {
    this.respuestaGuardada =
      Array.isArray(respuestas) && respuestas.length > 0;
  }

  cerrarRespuesta(): void {
    this.mostrarRespuesta = false;
    this.documentoRespuesta = null;

    this.consultarRespuestaCaso();
  }

  cerrarCaso(): void {
    if (this.procesandoAccion) {
      return;
    }

    this.cambioGestion$.next();
    this.cargandoRespuestaCaso = false;
    this.errorRespuestaCaso = '';

    this.mostrarRespuesta = false;
    this.documentoRespuesta = null;

    this.mostrarCaso = false;
    this.documentoSeleccionado = null;

    this.cargarDocumentos();
  }

  async enviarRespuestaAlNivel3(documento: any): Promise<void> {
    if (
      this.procesandoAccion ||
      this.cargandoRespuestaCaso ||
      this.errorRespuestaCaso ||
      this.destruido
    ) {
      return;
    }

    const id = Number(documento?.idExpediente);

    if (!id || id !== Number(this.documentoSeleccionado?.idExpediente)) {
      return;
    }

    this.procesandoAccion = true;

    try {
      const respuestas = await firstValueFrom(
        this.integridadService
          .listarRespuestasNivel4(id)
          .pipe(takeUntil(this.destroy$))
      );

      if (this.destruido) {
        return;
      }

      this.respuestaGuardada =
        Array.isArray(respuestas) && respuestas.length > 0;

      if (!this.respuestaGuardada) {
        await Swal.fire({
          icon: 'warning',
          title: 'Respuesta requerida',
          text: 'Primero registre la respuesta con su PDF.'
        });
        return;
      }

      const resultado = await Swal.fire({
        icon: 'question',
        title: '¿Enviar respuesta a Integridad Nivel 3?',
        text: 'Se remitirá el caso con las respuestas registradas.',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#145c43'
      });

      if (!resultado.isConfirmed || this.destruido) {
        return;
      }

      await firstValueFrom(
        this.integridadService
          .enviarRespuestaDesdeNivel4(id)
          .pipe(takeUntil(this.destroy$))
      );

      if (this.destruido) {
        return;
      }

      this.procesandoAccion = false;
      this.cerrarCaso();

      void Swal.fire({
        icon: 'success',
        title: 'Respuesta enviada',
        text: 'El caso fue enviado a Integridad Nivel 3.',
        confirmButtonText: 'Aceptar'
      });
    } catch (error: any) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo enviar',
          text: this.mensajeError(
            error,
            'No se pudo enviar la respuesta.'
          )
        });
      }
    } finally {
      this.procesandoAccion = false;
    }
  }

  async devolverANivel3(documento: any): Promise<void> {
    if (
      this.procesandoAccion ||
      this.cargandoRespuestaCaso ||
      this.errorRespuestaCaso ||
      this.respuestaGuardada ||
      this.destruido
    ) {
      return;
    }

    const id = Number(documento?.idExpediente);
    const observacion = String(documento?.observacionActual ?? '').trim();

    if (!id || !observacion) {
      void Swal.fire({
        icon: 'warning',
        title: 'Observación requerida',
        text: 'Indique el motivo de devolución.'
      });
      return;
    }

    this.procesandoAccion = true;

    try {
      const resultado = await Swal.fire({
        icon: 'warning',
        title: '¿Devolver a Integridad Nivel 3?',
        text: 'El caso será devuelto como observado.',
        showCancelButton: true,
        confirmButtonText: 'Sí, devolver',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b42318'
      });

      if (!resultado.isConfirmed || this.destruido) {
        return;
      }

      await firstValueFrom(
        this.integridadService
          .devolverDesdeNivel4(id, observacion)
          .pipe(takeUntil(this.destroy$))
      );

      if (this.destruido) {
        return;
      }

      this.procesandoAccion = false;
      this.cerrarCaso();

      void Swal.fire({
        icon: 'success',
        title: 'Documento devuelto',
        text: 'El caso llegó a Integridad Nivel 3 como observado.',
        confirmButtonText: 'Aceptar'
      });
    } catch (error: any) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo devolver',
          text: this.mensajeError(
            error,
            'No se pudo devolver el caso.'
          )
        });
      }
    } finally {
      this.procesandoAccion = false;
    }
  }

  private mensajeError(error: any, alternativo: string): string {
    return typeof error?.error?.message === 'string'
      ? error.error.message
      : typeof error?.error?.mensaje === 'string'
        ? error.error.mensaje
        : alternativo;
  }
}