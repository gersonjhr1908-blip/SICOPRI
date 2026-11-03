import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

import { ExpedienteService } from '../../../services/expediente.service';

import { IntegridadService } from '../../../services/integridad.service';

import { GestionarIntegridad3Component } from './gestionar-integridad3/gestionar-integridad3.component';

import { RespuestaIntegridad3Component } from './respuesta-integridad3/respuesta-integridad3.component';

import { InformarEnvioComponent } from './informar-envio/informar-envio.component';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-pendientes-integridad3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarIntegridad3Component,
    InformarEnvioComponent,
    RespuestaIntegridad3Component,
  ],
  templateUrl: './pendientes-integridad3.component.html',
  styleUrl: './pendientes-integridad3.component.css',
})
export class PendientesIntegridad3Component implements OnInit, OnDestroy {
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
  respuestaGuardada = false;
  respuestaNivel4Guardada = false;
  errorConsultaRespuesta = '';

  mostrarInformeEnvio = false;
  documentoInformeEnvio: any = null;
  informeEnvioGuardado = false;

  abrirInformeEnvio(documento: any): void {
    this.documentoInformeEnvio = documento;
    this.mostrarInformeEnvio = true;
  }

  cerrarInformeEnvio(): void {
    this.mostrarInformeEnvio = false;
    this.documentoInformeEnvio = null;
  }

  actualizarInformesEnvio(informes: any[]): void {
    this.informeEnvioGuardado = informes.length > 0;
  }

  abrirRespuesta(documento: any): void {
    this.documentoRespuesta = documento;
    this.mostrarRespuesta = true;
  }

  cerrarRespuesta(): void {
    this.mostrarRespuesta = false;
    this.documentoRespuesta = null;
  }

  actualizarRespuestas(respuestas: any[]): void {
    this.respuestaGuardada = Array.isArray(respuestas) && respuestas.length > 0;

    if (this.respuestaGuardada && this.documentoSeleccionado) {
      this.documentoSeleccionado = {
        ...this.documentoSeleccionado,
        idEstado: 4,
      };
    }
  }

  procesandoAccion = false;

  async devolverANivel2(documento: any): Promise<void> {
    if (this.procesandoAccion) {
      return;
    }

    const id = Number(documento?.idExpediente);

    const observacion = String(documento?.observacionActual ?? '').trim();

    if (!id || !observacion) {
      void Swal.fire({
        icon: 'warning',
        title: 'Observación requerida',
        text: 'Indique el motivo de la devolución.',
      });
      return;
    }

    this.procesandoAccion = true;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Devolver a Integridad Nivel 2?',
      text: 'La denuncia llegará como observada para su subsanación.',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });

    if (!resultado.isConfirmed) {
      this.procesandoAccion = false;
      return;
    }

    this.integridadService
      .devolverDesdeNivel3(id, observacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.procesandoAccion = false;
          this.cerrarCaso();

          void Swal.fire({
            icon: 'success',
            title: 'Documento devuelto',
            text: 'La denuncia llegó a Integridad Nivel 2 como observada.',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (error: any) => {
          this.procesandoAccion = false;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo devolver',
            text:
              typeof error?.error?.message === 'string'
                ? error.error.message
                : 'No se pudo devolver la denuncia.',
          });
        },
      });
  }

  async enviarAIntegridad4(documento: any): Promise<void> {
    if (this.procesandoAccion || this.destruido) {
      return;
    }

    const id = Number(documento?.idExpediente);

    if (!id || id !== Number(this.documentoSeleccionado?.idExpediente)) {
      return;
    }

    if (
      Number(documento.nivelActual) !== 3 ||
      Number(documento.nivelDestino) !== 4
    ) {
      void Swal.fire({
        icon: 'warning',
        title: 'Revise el destino',
        text: 'El caso debe estar en Integridad 3 y tener destino final Integridad 4.',
      });
      return;
    }

    this.procesandoAccion = true;

    try {
      const informes = await firstValueFrom(
        this.integridadService
          .listarInformesEnvio(id)
          .pipe(takeUntil(this.destroy$)),
      );

      if (
        this.destruido ||
        id !== Number(this.documentoSeleccionado?.idExpediente)
      ) {
        return;
      }

      this.informeEnvioGuardado =
        Array.isArray(informes) && informes.length > 0;

      if (!this.informeEnvioGuardado) {
        await Swal.fire({
          icon: 'warning',
          title: 'Falta informar el envío',
          text: 'Primero registre el informe de envío con su PDF.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#145c43',
        });

        return;
      }

      const resultado = await Swal.fire({
        icon: 'question',
        title: '¿Enviar a Integridad Nivel 4?',
        text: 'La denuncia será remitida con el informe de envío registrado.',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#145c43',
      });

      if (
        !resultado.isConfirmed ||
        this.destruido ||
        id !== Number(this.documentoSeleccionado?.idExpediente)
      ) {
        return;
      }

      await firstValueFrom(
        this.integridadService.enviarANivel4(id).pipe(takeUntil(this.destroy$)),
      );

      if (this.destruido) {
        return;
      }

      this.procesandoAccion = false;
      this.cerrarCaso();

      void Swal.fire({
        icon: 'success',
        title: 'Documento enviado',
        text: 'La denuncia fue enviada a Integridad Nivel 4.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#145c43',
      });
    } catch (error: any) {
      if (this.destruido) {
        return;
      }

      console.error('ERROR AL ENVIAR A INTEGRIDAD 4:', error);

      const cuerpo = error?.error;

      const mensaje =
        typeof cuerpo?.message === 'string'
          ? cuerpo.message
          : typeof cuerpo?.mensaje === 'string'
            ? cuerpo.mensaje
            : 'No se pudo consultar el informe o completar el envío.';

      void Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: mensaje,
      });
    } finally {
      this.procesandoAccion = false;
    }
  }

  async enviarRespuestaAlNivel2(documento: any): Promise<void> {
    if (
      this.procesandoAccion ||
      this.cargandoRespuestaCaso ||
      this.errorConsultaRespuesta ||
      this.destruido
    ) {
      return;
    }

    const id = Number(documento?.idExpediente);
    const destino = Number(documento?.nivelDestino);

    if (
      !id ||
      ![3, 4].includes(destino) ||
      id !== Number(this.documentoSeleccionado?.idExpediente)
    ) {
      return;
    }

    this.procesandoAccion = true;

    try {
      const consulta =
        destino === 4
          ? this.integridadService.listarRespuestasNivel4(id)
          : this.integridadService.listarRespuestasNivel3(id);

      const respuestas = await firstValueFrom(
        consulta.pipe(takeUntil(this.destroy$)),
      );

      if (this.destruido) {
        return;
      }

      if (!Array.isArray(respuestas) || respuestas.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Respuesta requerida',
          text: 'No existe una respuesta registrada para remitir.',
        });
        return;
      }

      const resultado = await Swal.fire({
        icon: 'question',
        title: '¿Enviar respuesta a Integridad Nivel 2?',
        text:
          destino === 4
            ? 'Se remitirá la respuesta de Integridad Nivel 4. El informe de envío seguirá disponible para consulta.'
            : 'Se remitirá la respuesta registrada por Integridad Nivel 3.',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#145c43',
      });

      if (
        !resultado.isConfirmed ||
        this.destruido ||
        id !== Number(this.documentoSeleccionado?.idExpediente)
      ) {
        return;
      }

      const envio =
        destino === 4
          ? this.integridadService.remitirRespuestaNivel4AlNivel2(id)
          : this.integridadService.enviarRespuestaNivel2(id);

      await firstValueFrom(envio.pipe(takeUntil(this.destroy$)));

      if (this.destruido) {
        return;
      }

      this.procesandoAccion = false;
      this.cerrarCaso();

      void Swal.fire({
        icon: 'success',
        title: 'Respuesta enviada',
        text: 'La denuncia llegó a Integridad Nivel 2 como concluida.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#145c43',
      });
    } catch (error: any) {
      if (!this.destruido) {
        void Swal.fire({
          icon: 'error',
          title: 'No se pudo enviar',
          text:
            error?.error?.message ||
            error?.error?.mensaje ||
            'No se pudo remitir la respuesta.',
        });
      }
    } finally {
      this.procesandoAccion = false;
    }
  }

  private readonly cambioGestion$ = new Subject<void>();

  cargandoRespuestaCaso = false;

  private readonly destroy$ = new Subject<void>();
  private readonly recarga$ = new Subject<void>();
  private destruido = false;

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

    this.destroy$.next();
    this.destroy$.complete();

    this.cambioGestion$.next();
    this.cambioGestion$.complete();
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
              Number(exp.nivelActual) === 3 &&
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
    this.cambioGestion$.next();

    this.menuAbiertoId = null;
    this.documentoSeleccionado = documento;

    this.respuestaGuardada = false;
    this.respuestaNivel4Guardada = false;
    this.informeEnvioGuardado = false;

    this.cargandoRespuestaCaso = false;
    this.errorConsultaRespuesta = '';
    this.mostrarCaso = true;

    this.consultarRespuestaCaso();

    if (Number(documento.nivelDestino) === 4) {
      this.consultarInformeCaso();
    }
  }

  consultarInformeCaso(): void {
    const id = Number(this.documentoSeleccionado?.idExpediente);

    if (!id) {
      return;
    }

    this.integridadService
      .listarInformesEnvio(id)
      .pipe(takeUntil(this.cambioGestion$), takeUntil(this.destroy$))
      .subscribe({
        next: (informes: any[]) => {
          this.informeEnvioGuardado =
            Array.isArray(informes) && informes.length > 0;
        },
        error: (error: any) => {
          this.informeEnvioGuardado = false;

          console.error('ERROR AL CONSULTAR INFORMES DEL CASO:', error);

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo consultar el informe',
            text: 'Abra Informar envío para volver a consultar. El envío comprobará nuevamente los informes.',
          });
        },
      });
  }

  consultarRespuestaCaso(): void {
    const id = Number(this.documentoSeleccionado?.idExpediente);
    const destino = Number(this.documentoSeleccionado?.nivelDestino);

    if (!id) {
      return;
    }

    this.cargandoRespuestaCaso = true;
    this.errorConsultaRespuesta = '';

    const consulta =
      destino === 4
        ? this.integridadService.listarRespuestasNivel4(id)
        : this.integridadService.listarRespuestasNivel3(id);

    consulta
      .pipe(takeUntil(this.cambioGestion$), takeUntil(this.destroy$))
      .subscribe({
        next: (respuestas: any[]) => {
          const tieneRespuestas =
            Array.isArray(respuestas) && respuestas.length > 0;

          this.respuestaGuardada = destino === 3 && tieneRespuestas;

          this.respuestaNivel4Guardada = destino === 4 && tieneRespuestas;

          this.cargandoRespuestaCaso = false;
        },
        error: (error: any) => {
          this.cargandoRespuestaCaso = false;

          this.errorConsultaRespuesta =
            error?.error?.message || 'No se pudieron consultar las respuestas.';

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo consultar la respuesta',
            text: 'Cierre y vuelva a abrir Gestionar para reintentar.',
          });
        },
      });
  }

  cerrarCaso(): void {
    this.cambioGestion$.next();
    this.cargandoRespuestaCaso = false;
    this.mostrarCaso = false;
    this.documentoSeleccionado = null;
    this.cargarDocumentos();
  }
}
