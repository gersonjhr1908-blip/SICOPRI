import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { Subject, takeUntil } from 'rxjs';

import Swal from 'sweetalert2';

import {
  IntegridadService
} from '../../../../services/integridad.service';

@Component({
  selector: 'app-respuesta-integridad3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respuesta-integridad3.component.html',
  styleUrl: './respuesta-integridad3.component.css'
})
export class RespuestaIntegridad3Component
  implements OnChanges, OnDestroy {

  @Input() denuncia: any = null;

  @Output() cerrar = new EventEmitter<void>();

  @Output() respuestasActualizadas =
    new EventEmitter<any[]>();

  pestanaActiva = 1;
  mostrarVisorRespuesta = false;

  eliminandoRespuesta: number | null = null;

  nombreDocumento = '';
  tipoDocumento = '';
  otroTipoDocumento = '';
  fechaDocumento = this.fechaActual();
  descripcion = '';

  readonly origen = 'Integridad - Nivel 3';
  readonly destino = 'Integridad - Nivel 2';

  archivoSeleccionado: File | null = null;

  respuestas: any[] = [];
  respuestaSeleccionada: any = null;

  cargando = false;
  guardando = false;
  cargandoPdf = false;

  error = '';
  errorPdf = '';

  pdfUrl: SafeResourceUrl | null = null;

  private objectUrl: string | null = null;
  private versionPdf = 0;
  private versionCaso = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly cambioCaso$ = new Subject<void>();

  constructor(
    private integridadService: IntegridadService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['denuncia']) {
      ++this.versionCaso;

      this.cambioCaso$.next();
      this.liberarPdf();

      this.pestanaActiva = 1;
      this.mostrarVisorRespuesta = false;
      this.eliminandoRespuesta = null;

      this.respuestas = [];
      this.respuestaSeleccionada = null;

      this.cargando = false;
      this.guardando = false;
      this.error = '';
      this.errorPdf = '';

      this.limpiarFormulario();

      if (
        Number.isInteger(this.idExpediente) &&
        this.idExpediente > 0
      ) {
        this.cargarRespuestas();
      } else {
        this.error = 'No se encontró el expediente.';
      }
    }
  }

  ngOnDestroy(): void {
    ++this.versionCaso;

    this.cambioCaso$.next();
    this.cambioCaso$.complete();

    this.destroy$.next();
    this.destroy$.complete();

    this.liberarPdf();
  }

  get idExpediente(): number {
    return Number(this.denuncia?.idExpediente || 0);
  }

  cambiarPestana(numero: number): void {
    if (numero === 1 || numero === 2) {
      this.pestanaActiva = numero;
    }
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] || null;

    input.value = '';

    if (
      !archivo ||
      this.guardando ||
      this.eliminandoRespuesta !== null
    ) {
      return;
    }

    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
      this.advertir('La respuesta solo admite archivos PDF.');
      return;
    }

    if (
      archivo.size === 0 ||
      archivo.size > 1024 * 1024 * 1024
    ) {
      this.advertir(
        'El PDF debe tener contenido y no superar los 1 GB.'
      );
      return;
    }

    this.archivoSeleccionado = archivo;
  }

  quitarArchivo(): void {
    if (
      this.guardando ||
      this.eliminandoRespuesta !== null
    ) {
      return;
    }

    this.archivoSeleccionado = null;
  }

  cargarRespuestas(): void {
    if (!this.idExpediente || this.cargando) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.integridadService
      .listarRespuestasNivel3(this.idExpediente)
      .pipe(
        takeUntil(this.cambioCaso$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any[]) => {
          this.cargando = false;

          this.respuestas = Array.isArray(data)
            ? data
            : [];

          this.respuestasActualizadas.emit([
            ...this.respuestas
          ]);
        },
        error: (error: any) => {
          this.cargando = false;

          this.error = this.mensajeError(
            error,
            'No se pudieron consultar las respuestas.'
          );
        }
      });
  }

  guardarRespuesta(): void {
    if (
      this.guardando ||
      this.cargando ||
      this.error ||
      !this.idExpediente ||
      this.eliminandoRespuesta !== null
    ) {
      return;
    }

    if (Number(this.denuncia?.nivelDestino) !== 3) {
      this.advertir(
        'La respuesta de Integridad 3 corresponde a casos con destino final Nivel 3.'
      );
      return;
    }

    const nombre = this.nombreDocumento.trim();

    const tipo = this.tipoDocumento === 'OTROS'
      ? this.otroTipoDocumento.trim()
      : this.tipoDocumento.trim();

    const descripcion = this.descripcion.trim();

    if (
      this.tipoDocumento === 'OTROS' &&
      !tipo
    ) {
      this.advertir(
        'Especifique el tipo de documento.'
      );
      return;
    }

    if (
      !nombre ||
      !tipo ||
      !this.fechaDocumento ||
      !descripcion
    ) {
      this.advertir(
        'Complete nombre, tipo, fecha y descripción de la respuesta.'
      );
      return;
    }

    if (nombre.length > 150) {
      this.advertir(
        'El nombre del documento admite máximo 150 caracteres.'
      );
      return;
    }

    if (tipo.length > 100) {
      this.advertir(
        'El tipo de documento admite máximo 100 caracteres.'
      );
      return;
    }

    if (descripcion.length > 2000) {
      this.advertir(
        'La respuesta admite máximo 2000 caracteres.'
      );
      return;
    }

    if (!this.archivoSeleccionado) {
      this.advertir(
        'Adjunte el PDF de la respuesta.'
      );
      return;
    }

    this.guardando = true;

    this.integridadService
      .guardarRespuestaNivel3(
        this.idExpediente,
        {
          nombreDocumento: nombre,
          tipoDocumento: tipo,
          fechaDocumento: this.fechaDocumento,
          descripcion
        },
        this.archivoSeleccionado
      )
      .pipe(
        takeUntil(this.cambioCaso$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.guardando = false;
          this.limpiarFormulario();
          this.pestanaActiva = 2;
          this.cargarRespuestas();

          void Swal.fire({
            icon: 'success',
            title: 'Respuesta guardada',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#145c43'
          });
        },
        error: (error: any) => {
          this.guardando = false;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar',
            text: this.mensajeError(
              error,
              'No se pudo registrar la respuesta.'
            ),
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  abrirPdfRespuesta(respuesta: any): void {
    if (
      this.guardando ||
      this.eliminandoRespuesta !== null
    ) {
      return;
    }

    this.mostrarVisorRespuesta = true;
    this.verRespuesta(respuesta);
  }

  cerrarVisorRespuesta(): void {
    this.mostrarVisorRespuesta = false;
    this.respuestaSeleccionada = null;
    this.errorPdf = '';
    this.liberarPdf();
  }

  verRespuesta(respuesta: any): void {
    const idRespuesta = Number(respuesta?.idRespuesta);

    if (
      !Number.isInteger(idRespuesta) ||
      idRespuesta <= 0
    ) {
      return;
    }

    this.liberarPdf();

    this.respuestaSeleccionada = respuesta;
    this.cargandoPdf = true;
    this.errorPdf = '';

    const version = this.versionPdf;

    this.integridadService
      .verPdfRespuestaNivel3(
        this.idExpediente,
        idRespuesta
      )
      .pipe(
        takeUntil(this.cambioCaso$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (blob: Blob) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.objectUrl = URL.createObjectURL(
            new Blob(
              [blob],
              { type: 'application/pdf' }
            )
          );

          this.pdfUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(
              this.objectUrl
            );

          this.cargandoPdf = false;
        },
        error: (error: any) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.cargandoPdf = false;

          this.errorPdf = this.mensajeError(
            error,
            'No se pudo visualizar la respuesta.'
          );
        }
      });
  }

  async eliminarRespuesta(
    respuesta: any
  ): Promise<void> {
    const idRespuesta = Number(respuesta?.idRespuesta);
    const idExpediente = this.idExpediente;

    if (
      !Number.isInteger(idRespuesta) ||
      idRespuesta <= 0 ||
      this.guardando ||
      this.cargando ||
      this.eliminandoRespuesta !== null
    ) {
      return;
    }

    const version = this.versionCaso;

    this.eliminandoRespuesta = idRespuesta;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar respuesta?',
      text: `Se retirará "${respuesta.nombreDocumento || 'el documento'}" de las respuestas activas.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318'
    });

    if (version !== this.versionCaso) {
      return;
    }

    if (!resultado.isConfirmed) {
      this.eliminandoRespuesta = null;
      return;
    }

    this.integridadService
      .eliminarRespuestaNivel3(
        idExpediente,
        idRespuesta
      )
      .pipe(
        takeUntil(this.cambioCaso$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.eliminandoRespuesta = null;
          this.cerrarVisorRespuesta();
          this.cargarRespuestas();

          void Swal.fire({
            icon: 'success',
            title: 'Respuesta eliminada',
            timer: 1300,
            showConfirmButton: false
          });
        },
        error: (error: any) => {
          this.eliminandoRespuesta = null;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: this.mensajeError(
              error,
              'No se pudo eliminar la respuesta.'
            ),
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  obtenerTamano(bytes: number): string {
    if (!bytes) {
      return '0 KB';
    }

    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cerrarModal(): void {
    if (
      this.guardando ||
      this.cargando ||
      this.eliminandoRespuesta !== null
    ) {
      return;
    }

    ++this.versionCaso;

    this.cambioCaso$.next();
    this.liberarPdf();

    this.mostrarVisorRespuesta = false;
    this.cerrar.emit();
  }

  private limpiarFormulario(): void {
    this.nombreDocumento = '';
    this.tipoDocumento = '';
    this.otroTipoDocumento = '';
    this.fechaDocumento = this.fechaActual();
    this.descripcion = '';
    this.archivoSeleccionado = null;
  }

  private fechaActual(): string {
    const fecha = new Date();

    return [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0')
    ].join('-');
  }

  private liberarPdf(): void {
    ++this.versionPdf;

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = null;
    this.pdfUrl = null;
    this.cargandoPdf = false;
  }

  private advertir(text: string): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Revise los datos',
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#145c43'
    });
  }

  private mensajeError(
    error: any,
    alternativo: string
  ): string {
    const cuerpo = error?.error;

    if (typeof cuerpo?.message === 'string') {
      return cuerpo.message;
    }

    if (typeof cuerpo?.mensaje === 'string') {
      return cuerpo.mensaje;
    }

    if (
      typeof cuerpo === 'string' &&
      cuerpo.trim()
    ) {
      return cuerpo;
    }

    return alternativo;
  }
}