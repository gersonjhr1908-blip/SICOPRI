import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormsModule
} from '@angular/forms';

import {
  ExpedienteService
} from '../../../services/expediente.service';

import {
  GestionarCasoQrd4Component
} from './gestionar-caso-qrd4/gestionar-caso-qrd4.component';

import {
  RespuestaQrd4Component
} from './respuesta-qrd4/respuesta-qrd4.component';


@Component({
  selector: 'app-pendientes-qrd4',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarCasoQrd4Component,
    RespuestaQrd4Component
  ],
  templateUrl: './pendientes-qrd4.component.html',
  styleUrl: './pendientes-qrd4.component.css'
})
export class PendientesQrd4Component implements OnInit {

  search: string = '';

  documentos: any[] = [];
  documentosOriginales: any[] = [];

  tiposDocumento: any[] = [];

  // Modal Gestionar Caso
  mostrarVerCaso: boolean = false;
  documentoSeleccionado: any = null;

  // Modal secundario Dar respuesta
  mostrarRespuesta: boolean = false;
  expedienteRespuesta: any = null;

  constructor(
    private expedienteService: ExpedienteService
  ) {}

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
        console.error('ERROR TIPOS DOCUMENTO QRD4:', err);
        this.tiposDocumento = [];
        this.cargarDocumentos();
      }
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

          const categoriaSistema = String(exp.categoria || '')
            .trim()
            .toUpperCase();

          const tipo = Number(exp.idTipoExpediente);
          const estado = Number(exp.idEstado);
          const nivelActual = Number(exp.nivelActual);

          return (
            activo === 'S' &&
            categoriaSistema !== 'INTEGRIDAD' &&
            [1, 2, 3].includes(tipo) &&
            nivelActual === 4 &&
            [2, 3].includes(estado)
          );
        });

        this.documentosOriginales = pendientes.map((exp: any) => ({
          ...exp,
          categoriaQrd: this.obtenerCategoriaQrd(exp.idTipoExpediente),
          documento: this.obtenerTipoDocumento(exp),
          estadoVisual: this.obtenerEstadoVisual(exp),
          origenVisual: this.obtenerOrigenVisual(exp)
        }));

        this.documentos = [...this.documentosOriginales];

        console.log('PENDIENTES QRD4:', this.documentos);
      },

      error: (err) => {
        console.error('ERROR PENDIENTES QRD4:', err);

        this.documentos = [];
        this.documentosOriginales = [];
      }
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
        Number(tipo.idTipoDocumento) === Number(exp.idTipoDocumento)
    );

    const nombre = encontrado
      ? String(encontrado.nombre || '').trim()
      : '';

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

    return 'PENDIENTE';
  }

  obtenerOrigenVisual(exp: any): string {
    const nivelCreacion = exp.nivelCreacion == null
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

  // Se ejecuta desde Gestionar Caso QRD4:
  // botón DAR RESPUESTA.
  abrirRespuesta(expediente: any): void {
    if (!expediente) {
      return;
    }

    this.expedienteRespuesta = expediente;
    this.mostrarRespuesta = true;
  }

  cerrarRespuesta(): void {
    this.mostrarRespuesta = false;
    this.expedienteRespuesta = null;

    this.cargarDocumentos();
  }

  // Se utilizará cuando QRD4 devuelva el caso hacia QRD3.
  enviarAQr3(documento: any): void {
    const idExpediente = Number(documento?.idExpediente);

    if (!idExpediente) {
      return;
    }

    this.expedienteService.enviarANivel3(idExpediente).subscribe({
      next: () => {
        this.cerrarVerCaso();
      },

      error: (err) => {
        console.error('ERROR QRD4 -> QRD3:', err);
      }
    });
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
        doc.origenVisual
      ].some((valor: any) =>
        String(valor || '').toLowerCase().includes(texto)
      );
    });
  }

  limpiarBusqueda(): void {
    this.search = '';
    this.documentos = [...this.documentosOriginales];
  }
}