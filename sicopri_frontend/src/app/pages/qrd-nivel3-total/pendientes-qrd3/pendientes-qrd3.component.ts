import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { firstValueFrom, Observable } from 'rxjs';

import { ExpedienteService } from '../../../services/expediente.service';

import { GestionarCasoQrd3Component } from './gestionar-caso-qrd3/gestionar-caso-qrd3.component';

import { RespuestaQrd3Component } from './respuesta-qrd3/respuesta-qrd3.component';

@Component({
  selector: 'app-pendientes-qrd3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarCasoQrd3Component,
    RespuestaQrd3Component,
  ],
  templateUrl: './pendientes-qrd3.component.html',
  styleUrl: './pendientes-qrd3.component.css',
})
export class PendientesQrd3Component implements OnInit {
  @ViewChild(GestionarCasoQrd3Component)
  gestionarCaso?: GestionarCasoQrd3Component;

  search = '';

  documentos: any[] = [];
  documentosOriginales: any[] = [];
  tiposDocumento: any[] = [];

  mostrarVerCaso = false;
  documentoSeleccionado: any = null;

  mostrarRespuesta = false;
  documentoRespuesta: any = null;

  private procesandoAccion = false;

  private colocarAlertaEncima(popup: HTMLElement): void {
    if (popup.parentElement) {
      popup.parentElement.style.zIndex = '2000000';
    }
  }

  private async confirmarAccion(
    titulo: string,
    mensaje: string,
    operacion: () => Observable<any>,
    mensajeExito: (respuesta: any) => string,
    alCompletar?: () => void,
    esDevolucion = false,
  ): Promise<void> {
    if (this.procesandoAccion) {
      return;
    }

    this.procesandoAccion = true;

    try {
      const confirmacion = await Swal.fire({
        icon: esDevolucion ? 'warning' : 'question',
        title: titulo,
        text: mensaje,
        showCancelButton: true,
        confirmButtonText: esDevolucion ? 'SÍ, DEVOLVER' : 'SÍ, ENVIAR',
        cancelButtonText: 'CANCELAR',
        confirmButtonColor: esDevolucion ? '#b42318' : '#176b49',
        cancelButtonColor: '#8f9893',
        reverseButtons: true,
        focusCancel: true,
        didOpen: (popup) => this.colocarAlertaEncima(popup),
      });

      if (!confirmacion.isConfirmed) {
        return;
      }

      void Swal.fire({
        title: 'Procesando…',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: (popup) => {
          this.colocarAlertaEncima(popup);
          Swal.showLoading();
        },
      });

      let respuesta: any;

      try {
        respuesta = await firstValueFrom(operacion());
      } catch (err: any) {
        await Swal.fire({
          icon: 'error',
          title: 'No se pudo completar la operación',
          text:
            err?.error?.message ||
            err?.error?.mensaje ||
            'Ocurrió un error. Inténtelo nuevamente.',
          confirmButtonColor: '#176b49',
          didOpen: (popup) => this.colocarAlertaEncima(popup),
        });

        return;
      }

      alCompletar?.();
      this.cerrarVerCaso();

      await Swal.fire({
        icon: 'success',
        title: 'Operación completada',
        text: mensajeExito(respuesta),
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#176b49',
        didOpen: (popup) => this.colocarAlertaEncima(popup),
      });
    } finally {
      this.procesandoAccion = false;
    }
  }
  constructor(private expedienteService: ExpedienteService) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.expedienteService.getTiposDocumento().subscribe({
      next: (data) => {
        this.tiposDocumento = data || [];
        this.cargarDocumentos();
      },

      error: (err) => {
        console.error('ERROR TIPOS DOCUMENTO QRD3:', err);

        this.tiposDocumento = [];
        this.cargarDocumentos();
      },
    });
  }

  cargarDocumentos(): void {
    this.expedienteService.listarExpedientes().subscribe({
      next: (data) => {
        const expedientes = data || [];

        const pendientes = expedientes.filter((exp: any) => {
          const activo = String(exp.activo || '')
            .trim()
            .toUpperCase();

          const categoria = String(exp.categoria || '')
            .trim()
            .toUpperCase();

          const tipo = Number(exp.idTipoExpediente);

          const estado = Number(exp.idEstado);

          const nivelActual = Number(exp.nivelActual);

          return (
            activo === 'S' &&
            categoria !== 'INTEGRIDAD' &&
            [1, 2, 3].includes(tipo) &&
            nivelActual === 3 &&
            [2, 3, 4].includes(estado)
          );
        });

        this.documentosOriginales = pendientes.map((exp: any) => ({
          ...exp,
          categoriaQrd: this.obtenerCategoriaQrd(exp.idTipoExpediente),
          documento: this.obtenerTipoDocumento(exp),
          estadoVisual: this.obtenerEstadoVisual(exp),
          origenVisual: this.obtenerOrigenVisual(exp),
        }));

        this.documentos = [...this.documentosOriginales];

        this.documentosOriginales.forEach((doc) => {
          this.cargarAlertaQrd4(doc);
        });
      },

      error: (err) => {
        console.error('ERROR PENDIENTES QRD3:', err);

        this.documentos = [];
        this.documentosOriginales = [];
      },
    });
  }

  cargarAlertaQrd4(doc: any): void {
    doc.alertaQrd4 = '';

    const idExpediente = Number(doc.idExpediente);

    if (!idExpediente) {
      return;
    }

    this.expedienteService.listarMovimientos(idExpediente).subscribe({
      next: (data: any[]) => {
        const movimientos = (Array.isArray(data) ? data : [])
          .filter(
            (m) =>
              String(m.activo ?? 'S')
                .trim()
                .toUpperCase() === 'S',
          )
          .sort((a, b) => {
            const fechaA = String(a.fechaMovimiento ?? '');
            const fechaB = String(b.fechaMovimiento ?? '');

            return (
              fechaB.localeCompare(fechaA) ||
              Number(b.idMovimiento) - Number(a.idMovimiento)
            );
          });

        const ultimo = movimientos[0];

        if (
          !ultimo ||
          Number(ultimo.nivelOrigen) !== 4 ||
          Number(ultimo.nivelDestino) !== 3
        ) {
          return;
        }

        const accion = String(ultimo.accion ?? '')
          .trim()
          .toUpperCase();

        if (accion.includes('RESPUESTA')) {
          doc.alertaQrd4 = '📩 Respuesta recibida de QRD4';
        } else if (accion.includes('OBSERVADO') || accion.includes('DEVUEL')) {
          doc.alertaQrd4 = '⚠ Documento devuelto por QRD4';
        } else {
          doc.alertaQrd4 = '📥 Documento recibido de QRD4';
        }
      },
      error: (err) => {
        console.error(
          'No se pudo consultar la procedencia del expediente:',
          idExpediente,
          err,
        );
      },
    });
  }

  obtenerCategoriaQrd(idTipoExpediente: number): string {
    switch (Number(idTipoExpediente)) {
      case 1:
        return 'DENUNCIA';

      case 2:
        return 'QUEJA';

      case 3:
        return 'RECLAMO';

      default:
        return '-';
    }
  }

  obtenerTipoDocumento(exp: any): string {
    const encontrado = this.tiposDocumento.find(
      (tipo: any) =>
        Number(tipo.idTipoDocumento) === Number(exp.idTipoDocumento),
    );

    const nombre = encontrado ? String(encontrado.nombre || '').trim() : '';

    if (
      nombre.toUpperCase() === 'OTROS' &&
      String(exp.otroTipoDocumento || '').trim()
    ) {
      return String(exp.otroTipoDocumento).trim();
    }

    return nombre || '-';
  }

  obtenerEstadoVisual(exp: any): string {
    const estado = Number(exp.idEstado);

    if (estado === 3) {
      return 'OBSERVADO';
    }

    if (estado === 4) {
      return 'CONCLUIDO';
    }

    return 'PENDIENTE';
  }

  obtenerOrigenVisual(exp: any): string {
    const nivelCreacion =
      exp.nivelCreacion == null ? 2 : Number(exp.nivelCreacion);

    return `QRD NIVEL ${nivelCreacion}`;
  }

  verCaso(documento: any): void {
    if (!documento) {
      return;
    }

    this.documentoSeleccionado = documento;
    this.mostrarVerCaso = true;
  }

  cerrarVerCaso(): void {
    this.mostrarVerCaso = false;
    this.documentoSeleccionado = null;
    this.cargarDocumentos();
  }

  abrirRespuesta(documento: any): void {
    if (!documento) {
      return;
    }

    this.documentoRespuesta = documento;
    this.mostrarRespuesta = true;
  }

  cerrarRespuesta(): void {
    this.mostrarRespuesta = false;
    this.documentoRespuesta = null;

    if (this.mostrarVerCaso && this.documentoSeleccionado) {
      this.gestionarCaso?.cargarRespuestasQrd4();
    }

    this.cargarDocumentos();
  }

  enviarAQr2(documento: any): Promise<void> {
    const id = Number(documento?.idExpediente);

    if (!id) {
      return Promise.resolve();
    }

    return this.confirmarAccion(
      '¿Enviar documento a QRD Nivel 2?',
      `El expediente ${documento.cinv} será remitido a QRD Nivel 2.`,
      () => this.expedienteService.enviarANivel2(id),
      () => 'El documento fue enviado a QRD Nivel 2.',
    );
  }

  enviarANivel4(documento: any): Promise<void> {
    const id = Number(documento?.idExpediente);

    if (!id) {
      return Promise.resolve();
    }

    return this.confirmarAccion(
      '¿Enviar a Inspectoría Nivel 4?',
      `El expediente ${documento.cinv} será enviado a QRD Nivel 4 para su atención.`,
      () => this.expedienteService.enviarANivel4(id),
      () => 'El expediente fue enviado a QRD Nivel 4.',
    );
  }

  async devolverANivel2(documento: any): Promise<void> {
    const id = Number(documento?.idExpediente);

    if (!id || this.procesandoAccion) {
      return;
    }

    const observacion = String(documento?.observacionActual || '').trim();

    if (!observacion) {
      await Swal.fire({
        icon: 'warning',
        title: 'Falta la observación',
        text: 'Escriba el motivo de la devolución.',
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#176b49',
        didOpen: (popup) => this.colocarAlertaEncima(popup),
      });

      return;
    }

    await this.confirmarAccion(
      '¿Devolver este documento?',
      `Se devolverá el expediente ${documento.cinv} Para su corrección.`,
      () => this.expedienteService.devolverDesdeNivel3(id, observacion),
      (respuesta) => {
        const nivel = Number(respuesta?.nivelActual);

        return [2, 3, 4].includes(nivel)
          ? `El documento regresó a QRD Nivel ${nivel} como OBSERVADO.`
          : 'El documento fue devuelto como OBSERVADO.';
      },
      undefined,
      true,
    );
  }

  buscarDocumentos(): void {
    const texto = this.search.trim().toLowerCase();

    if (!texto) {
      this.documentos = [...this.documentosOriginales];
      return;
    }

    this.documentos = this.documentosOriginales.filter((doc: any) =>
      [
        doc.cinv,
        doc.categoriaQrd,
        doc.documento,
        doc.nroDocumento,
        doc.asunto,
        doc.estadoVisual,
        doc.origenVisual,
      ].some((valor: any) =>
        String(valor || '')
          .toLowerCase()
          .includes(texto),
      ),
    );
  }

  limpiarBusqueda(): void {
    this.search = '';

    this.documentos = [...this.documentosOriginales];
  }

  enviarRespuestaANivel2(documento: any): Promise<void> {
    const id = Number(documento?.idExpediente);

    if (!id) {
      return Promise.resolve();
    }

    return this.confirmarAccion(
      '¿Enviar respuesta a QRD Nivel 2?',
      `Se enviará la respuesta del expediente ${documento.cinv} a QRD Nivel 2.`,
      () => this.expedienteService.enviarRespuestaANivel2(id),
      () => 'La respuesta fue enviada a QRD Nivel 2.',
      () => {
        this.mostrarRespuesta = false;
        this.documentoRespuesta = null;
      },
    );
  }
}
