import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ExpedienteService } from '../../../services/expediente.service';

import { VerCasoListadoQrdComponent } from './ver-caso-listado-qrd/ver-caso-listado-qrd.component';

import { TrazabilidadQrdComponent } from '../../trazabilidad-qrd/trazabilidad-qrd.component';

import { TrazabilidadPdfComponent } from '../../trazabilidad-qrd/trazabilidad-pdf/trazabilidad-pdf.component';

import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-listado-total',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VerCasoListadoQrdComponent,
    TrazabilidadQrdComponent,
    TrazabilidadPdfComponent,
  ],
  templateUrl: './listado-total.component.html',
  styleUrl: './listado-total.component.css',
})
export class ListadoTotalComponent implements OnInit {
  search = '';

  documentos: any[] = [];
  documentosOriginales: any[] = [];
  tiposDocumento: any[] = [];

  mostrarVerCaso = false;
  documentoSeleccionado: any = null;

  mostrarTrazabilidad = false;
  expedienteTrazabilidad: any = null;

  mostrarTrazPdf = false;
  expedienteTrazPdf: any = null;

  menuAccionesAbierto: number | null = null;

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
        console.error('ERROR TIPOS DOCUMENTO LISTADO QRD2:', err);

        this.tiposDocumento = [];
        this.cargarDocumentos();
      },
    });
  }

  cargarDocumentos(): void {
    this.expedienteService.listarExpedientes().subscribe({
      next: (data) => {
        const expedientes = data || [];

        const qrd2 = expedientes.filter((exp: any) => {
          const activo = String(exp.activo || '')
            .trim()
            .toUpperCase();

          const categoria = String(exp.categoria || '')
            .trim()
            .toUpperCase();

          const tipo = Number(exp.idTipoExpediente);

          const estado = Number(exp.idEstado);

          const nivelCreacion =
            exp.nivelCreacion == null ? 2 : Number(exp.nivelCreacion);

          const destinoFinal = Number(exp.nivelDestino);

          const gestionadoPorQrd2 =
            nivelCreacion === 2 || [3, 4].includes(destinoFinal);

          return (
            activo === 'S' &&
            categoria !== 'INTEGRIDAD' &&
            [1, 2, 3].includes(tipo) &&
            gestionadoPorQrd2 &&
            [2, 3, 4, 5].includes(estado)
          );
        });

        this.documentosOriginales = qrd2.map((exp: any) => ({
          ...exp,

          categoriaQrd: this.obtenerCategoriaQrd(exp.idTipoExpediente),

          documento: this.obtenerTipoDocumento(exp),

          estadoVisual: this.obtenerEstadoVisual(exp),

          ubicacionVisual: this.obtenerUbicacionVisual(exp),
        }));

        this.documentos = [...this.documentosOriginales];
      },

      error: (err) => {
        console.error('ERROR LISTADO TOTAL QRD2:', err);

        this.documentos = [];
        this.documentosOriginales = [];
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

    const nivelActual = Number(exp.nivelActual);

    if (estado === 5) {
      return 'ARCHIVADO';
    }

    if (estado === 4) {
      return 'CONCLUIDO';
    }

    if (estado === 3) {
      return 'OBSERVADO';
    }

    if ([3, 4].includes(nivelActual)) {
      return 'ENVIADO';
    }

    return 'PENDIENTE';
  }

  obtenerUbicacionVisual(exp: any): string {
    const nivel = Number(exp.nivelActual);

    if ([2, 3, 4].includes(nivel)) {
      return `QRD NIVEL ${nivel}`;
    }

    return '-';
  }

  verCaso(documento: any): void {
    if (!documento) {
      return;
    }

    this.documentoSeleccionado = documento;

    this.mostrarVerCaso = true;
    this.menuAccionesAbierto = null;
  }

  abrirTrazabilidad(documento: any): void {
    if (!documento) {
      return;
    }

    this.expedienteTrazabilidad = documento;

    this.mostrarTrazabilidad = true;
    this.menuAccionesAbierto = null;
  }

  cerrarTrazabilidad(): void {
    this.mostrarTrazabilidad = false;
    this.expedienteTrazabilidad = null;
  }

  alternarMenuAcciones(idExpediente: number): void {
    this.menuAccionesAbierto =
      this.menuAccionesAbierto === idExpediente ? null : idExpediente;
  }

  cerrarVerCaso(): void {
    this.mostrarVerCaso = false;
    this.documentoSeleccionado = null;
    this.cargarDocumentos();
  }

  imprimirTrazabilidad(documento: any): void {
    if (!documento?.idExpediente) {
      return;
    }

    this.menuAccionesAbierto = null;
    this.expedienteTrazPdf = documento;
    this.mostrarTrazPdf = true;
  }

  cerrarTrazPdf(): void {
    this.mostrarTrazPdf = false;
    this.expedienteTrazPdf = null;
  }

  async archivarExpediente(documento: any): Promise<void> {
    const idExpediente = Number(documento?.idExpediente);

    if (!idExpediente) {
      return;
    }

    this.menuAccionesAbierto = null;

    if (Number(documento.idEstado) !== 4) {
      await Swal.fire({
        icon: 'warning',
        title: 'No se puede archivar',
        text: 'Solo se pueden archivar expedientes concluidos.',
        confirmButtonColor: '#176b49',
      });
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Archivar este expediente?',
      text: `Se archivará el expediente ${documento.cinv}.`,
      showCancelButton: true,
      confirmButtonText: 'SÍ, ARCHIVAR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#176b49',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    Swal.fire({
      title: 'Archivando expediente…',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await firstValueFrom(
        this.expedienteService.archivarExpediente(idExpediente),
      );

      this.cargarDocumentos();

      await Swal.fire({
        icon: 'success',
        title: 'Expediente archivado',
        text: 'El expediente fue archivado correctamente.',
        confirmButtonColor: '#176b49',
      });
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo archivar',
        text:
          err?.error?.message ||
          err?.error?.mensaje ||
          'Ocurrió un error al archivar el expediente.',
        confirmButtonColor: '#176b49',
      });
    }
  }

  async eliminarExpediente(documento: any): Promise<void> {
    const idExpediente = Number(documento?.idExpediente);

    if (!idExpediente) {
      return;
    }

    this.menuAccionesAbierto = null;

    if (Number(documento.idEstado) !== 5) {
      await Swal.fire({
        icon: 'warning',
        title: 'No se puede eliminar',
        text: 'Solo se pueden eliminar expedientes archivados.',
        confirmButtonColor: '#176b49',
      });
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar este expediente?',
      text:
        `Se eliminará el expediente ${documento.cinv}. ` +
        'Confirme para continuar.',
      showCancelButton: true,
      confirmButtonText: 'SÍ, ELIMINAR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#b42318',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    Swal.fire({
      title: 'Eliminando expediente…',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      await firstValueFrom(
        this.expedienteService.eliminarExpediente(idExpediente),
      );

      this.cargarDocumentos();

      await Swal.fire({
        icon: 'success',
        title: 'Expediente eliminado',
        text: 'El expediente fue eliminado correctamente.',
        confirmButtonColor: '#176b49',
      });
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text:
          err?.error?.message ||
          err?.error?.mensaje ||
          'Ocurrió un error al eliminar el expediente.',
        confirmButtonColor: '#176b49',
      });
    }
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
        doc.ubicacionVisual,
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
}
