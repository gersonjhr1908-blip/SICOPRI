import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ExpedienteService } from '../../../services/expediente.service';

import {
  GestionarCasoQrd3Component
} from './gestionar-caso-qrd3/gestionar-caso-qrd3.component';

import {
  RespuestaQrd3Component
} from './respuesta-qrd3/respuesta-qrd3.component';

@Component({
  selector: 'app-pendientes-qrd3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarCasoQrd3Component,
    RespuestaQrd3Component
  ],
  templateUrl: './pendientes-qrd3.component.html',
  styleUrl: './pendientes-qrd3.component.css'
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

  constructor(
    private expedienteService: ExpedienteService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.expedienteService
      .getTiposDocumento()
      .subscribe({
        next: (data) => {
          this.tiposDocumento = data || [];
          this.cargarDocumentos();
        },

        error: (err) => {
          console.error(
            'ERROR TIPOS DOCUMENTO QRD3:',
            err
          );

          this.tiposDocumento = [];
          this.cargarDocumentos();
        }
      });
  }

  cargarDocumentos(): void {
    this.expedienteService
      .listarExpedientes()
      .subscribe({
        next: (data) => {
          const expedientes = data || [];

          const pendientes = expedientes.filter(
            (exp: any) => {
              const activo = String(
                exp.activo || ''
              )
                .trim()
                .toUpperCase();

              const categoria = String(
                exp.categoria || ''
              )
                .trim()
                .toUpperCase();

              const tipo = Number(
                exp.idTipoExpediente
              );

              const estado = Number(
                exp.idEstado
              );

              const nivelActual = Number(
                exp.nivelActual
              );

              return (
                activo === 'S' &&
                categoria !== 'INTEGRIDAD' &&
                [1, 2, 3].includes(tipo) &&
                nivelActual === 3 &&
                [2, 3, 4].includes(estado)
              );
            }
          );

          this.documentosOriginales =
            pendientes.map((exp: any) => ({
              ...exp,
              categoriaQrd:
                this.obtenerCategoriaQrd(
                  exp.idTipoExpediente
                ),
              documento:
                this.obtenerTipoDocumento(exp),
              estadoVisual:
                this.obtenerEstadoVisual(exp),
              origenVisual:
                this.obtenerOrigenVisual(exp)
            }));

          this.documentos = [
            ...this.documentosOriginales
          ];

          console.log(
            'PENDIENTES QRD3:',
            this.documentos
          );
        },

        error: (err) => {
          console.error(
            'ERROR PENDIENTES QRD3:',
            err
          );

          this.documentos = [];
          this.documentosOriginales = [];
        }
      });
  }

  obtenerCategoriaQrd(
    idTipoExpediente: number
  ): string {
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
    const encontrado =
      this.tiposDocumento.find(
        (tipo: any) =>
          Number(tipo.idTipoDocumento) ===
          Number(exp.idTipoDocumento)
      );

    const nombre = encontrado
      ? String(encontrado.nombre || '').trim()
      : '';

    if (
      nombre.toUpperCase() === 'OTROS' &&
      String(exp.otroTipoDocumento || '').trim()
    ) {
      return String(
        exp.otroTipoDocumento
      ).trim();
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
      exp.nivelCreacion == null
        ? 2
        : Number(exp.nivelCreacion);

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

  enviarAQr2(documento: any): void {
    const idExpediente = Number(
      documento?.idExpediente
    );

    if (!idExpediente) {
      return;
    }

    this.expedienteService
      .enviarANivel2(idExpediente)
      .subscribe({
        next: () => {
          this.cerrarVerCaso();
        },

        error: (err) => {
          console.error(
            'ERROR QRD3 -> QRD2:',
            err
          );
        }
      });
  }

  enviarANivel4(documento: any): void {
    const idExpediente = Number(
      documento?.idExpediente
    );

    if (!idExpediente) {
      return;
    }

    this.expedienteService
      .enviarANivel4(idExpediente)
      .subscribe({
        next: () => {
          this.cerrarVerCaso();
        },

        error: (err) => {
          console.error(
            'ERROR QRD3 -> QRD4:',
            err
          );
        }
      });
  }

  devolverANivel2(documento: any): void {
    const idExpediente = Number(documento?.idExpediente);

    const observacion = String(
      documento?.observacionActual || ''
    ).trim();

    if (!idExpediente) {
      return;
    }

    if (!observacion) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta la observación',
        text: 'Escriba el motivo de la devolución.',
        confirmButtonText: 'ACEPTAR',
        confirmButtonColor: '#176b49'
      });

      return;
    }

    this.expedienteService
      .devolverDesdeNivel3(idExpediente, observacion)
      .subscribe({
        next: (expediente: any) => {
          const nivelDevolucion = Number(
            expediente?.nivelActual
          );

          this.cerrarVerCaso();

          Swal.fire({
            icon: 'success',
            title: 'Documento devuelto',
            text:
              `El documento regresó a QRD Nivel ${nivelDevolucion} ` +
              'como OBSERVADO.',
            confirmButtonText: 'ACEPTAR',
            confirmButtonColor: '#176b49'
          });
        },

        error: (err: any) => {
          console.error(
            'ERROR AL DEVOLVER DESDE QRD3:',
            err
          );

          Swal.fire({
            icon: 'error',
            title: 'No se pudo devolver',
            text:
              err?.error?.message ||
              err?.error?.mensaje ||
              'Ocurrió un error al devolver el documento.',
            confirmButtonText: 'ACEPTAR'
          });
        }
      });
  }

  buscarDocumentos(): void {
    const texto = this.search
      .trim()
      .toLowerCase();

    if (!texto) {
      this.documentos = [
        ...this.documentosOriginales
      ];
      return;
    }

    this.documentos =
      this.documentosOriginales.filter(
        (doc: any) =>
          [
            doc.cinv,
            doc.categoriaQrd,
            doc.documento,
            doc.nroDocumento,
            doc.asunto,
            doc.estadoVisual,
            doc.origenVisual
          ].some((valor: any) =>
            String(valor || '')
              .toLowerCase()
              .includes(texto)
          )
      );
  }

  limpiarBusqueda(): void {
    this.search = '';

    this.documentos = [
      ...this.documentosOriginales
    ];
  }

  enviarRespuestaANivel2(documento: any): void {
    const idExpediente = Number(
      documento?.idExpediente
    );

    if (!idExpediente) {
      return;
    }

    this.expedienteService
      .enviarRespuestaANivel2(idExpediente)
      .subscribe({
        next: () => {
          this.mostrarRespuesta = false;
          this.documentoRespuesta = null;
          this.cerrarVerCaso();

          Swal.fire({
            icon: 'success',
            title: 'Respuesta enviada',
            text: 'La respuesta fue enviada a QRD Nivel 2.',
            confirmButtonColor: '#176b49'
          });
        },

        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar',
            text:
              err?.error?.message ||
              'Ocurrió un error al enviar la respuesta.'
          });
        }
      });
  }
}