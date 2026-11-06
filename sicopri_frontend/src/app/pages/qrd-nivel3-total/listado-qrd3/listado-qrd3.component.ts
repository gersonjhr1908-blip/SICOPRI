import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ExpedienteService } from '../../../services/expediente.service';
import { VerCasoListadoQrd3Component } from './ver-caso-listado-qrd3/ver-caso-listado-qrd3.component';

import { TrazabilidadQrdComponent } from '../../trazabilidad-qrd/trazabilidad-qrd.component';

import { TrazabilidadPdfComponent } from '../../trazabilidad-qrd/trazabilidad-pdf/trazabilidad-pdf.component';

@Component({
  selector: 'app-listado-qrd3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VerCasoListadoQrd3Component,
    TrazabilidadQrdComponent,
    TrazabilidadPdfComponent,
  ],
  templateUrl: './listado-qrd3.component.html',
  styleUrl: './listado-qrd3.component.css',
})
export class ListadoQrd3Component implements OnInit {
  search: string = '';
  documentos: any[] = [];
  documentosOriginales: any[] = [];
  tiposDocumento: any[] = [];

  mostrarVerCaso: boolean = false;
  documentoSeleccionado: any = null;

  menuAccionesAbierto: number | null = null;

  mostrarTrazabilidad = false;
  expedienteTrazabilidad: any = null;

  mostrarTrazPdf = false;
  expedienteTrazPdf: any = null;

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
        console.error('ERROR TIPOS DOCUMENTO LISTADO QRD3:', err);
        this.tiposDocumento = [];
        this.cargarDocumentos();
      },
    });
  }

  // Incluye expedientes en los que QRD3 participa o participó.
  // Los registros recién creados (estado 1) siguen únicamente en Registrar.
  cargarDocumentos(): void {
    this.expedienteService.listarExpedientes().subscribe({
      next: (data) => {
        const expedientes = data || [];

        const qrd3 = expedientes.filter((exp: any) => {
          const activo = String(exp.activo || '')
            .trim()
            .toUpperCase();
          const categoriaSistema = String(exp.categoria || '')
            .trim()
            .toUpperCase();
          const tipo = Number(exp.idTipoExpediente);
          const estado = Number(exp.idEstado);
          const nivelCreacion = Number(exp.nivelCreacion);
          const destinoFinal = Number(exp.nivelDestino);
          const nivelActual = Number(exp.nivelActual);

          const participaQrd3 =
            nivelCreacion === 3 ||
            nivelCreacion === 4 ||
            [3, 4].includes(destinoFinal) ||
            nivelActual === 3;

          return (
            activo === 'S' &&
            categoriaSistema !== 'INTEGRIDAD' &&
            [1, 2, 3].includes(tipo) &&
            participaQrd3 &&
            [2, 3, 4, 5, 11, 12, 19].includes(estado)
          );
        });

        this.documentosOriginales = qrd3.map((exp: any) => ({
          ...exp,
          categoriaQrd: this.obtenerCategoriaQrd(exp.idTipoExpediente),
          documento: this.obtenerTipoDocumento(exp),
          estadoVisual: this.obtenerEstadoVisual(exp),
          ubicacionVisual: this.obtenerUbicacionVisual(exp),
        }));

        this.documentos = [...this.documentosOriginales];
      },
      error: (err) => {
        console.error('ERROR LISTADO TOTAL QRD3:', err);
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

    if (estado === 5 || estado === 19) {
      return 'ARCHIVADO';
    }

    if (estado === 4) {
      return 'CONCLUIDO';
    }

    if (estado === 11) {
      return 'PENDIENTE DE REVISIÓN';
    }

    if ([3, 12].includes(estado)) {
      return 'DEVUELTO A CORREGIR';
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

  alternarMenuAcciones(idExpediente: number): void {
    this.menuAccionesAbierto =
      this.menuAccionesAbierto === idExpediente ? null : idExpediente;
  }

  cerrarVerCaso(): void {
    this.mostrarVerCaso = false;
    this.documentoSeleccionado = null;
    this.cargarDocumentos();
  }

  abrirTrazabilidad(documento: any): void {
    if (!documento?.idExpediente) {
      return;
    }

    this.menuAccionesAbierto = null;
    this.expedienteTrazabilidad = documento;
    this.mostrarTrazabilidad = true;
  }

  cerrarTrazabilidad(): void {
    this.mostrarTrazabilidad = false;
    this.expedienteTrazabilidad = null;
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

  buscarDocumentos(): void {
    const texto = this.search.trim().toLowerCase();

    if (!texto) {
      this.documentos = [...this.documentosOriginales];
      return;
    }

    this.documentos = this.documentosOriginales.filter((doc: any) => {
      return [
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
      );
    });
  }

  limpiarBusqueda(): void {
    this.search = '';
    this.documentos = [...this.documentosOriginales];
  }
}
