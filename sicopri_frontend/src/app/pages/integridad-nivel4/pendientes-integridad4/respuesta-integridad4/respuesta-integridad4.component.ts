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

import { IntegridadService } from '../../../../services/integridad.service';

@Component({
  selector: 'app-respuesta-integridad4',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respuesta-integridad4.component.html',
  styleUrl: './respuesta-integridad4.component.css'
})
export class RespuestaIntegridad4Component
  implements OnChanges, OnDestroy {

  @Input() denuncia: any = null;
  @Input() iniciarEnListado = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() respuestasActualizadas = new EventEmitter<any[]>();

  pestanaActiva = 1;

  nombreDocumento = '';
  tipoDocumento = '';
  otroTipoDocumento = '';
  fechaDocumento = this.fechaActual();
  descripcion = '';

  readonly origen = 'Integridad - Nivel 4';
  readonly destino = 'Integridad - Nivel 3';

  archivoSeleccionado: File | null = null;

  respuestas: any[] = [];
  respuestaSeleccionada: any = null;

  cargando = false;
  guardando = false;
  eliminandoRespuesta: number | null = null;

  error = '';
  errorPdf = '';
  cargandoPdf = false;
  mostrarVisorRespuesta = false;
  pdfUrl: SafeResourceUrl | null = null;

  private objectUrl: string | null = null;
  private versionPdf = 0;
  private versionCaso = 0;

  private readonly cambioCaso$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private integridadService: IntegridadService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['denuncia']) {
      ++this.versionCaso;
      this.cambioCaso$.next();
      this.liberarPdf();

      this.pestanaActiva = this.iniciarEnListado ? 2 : 1;
      this.respuestas = [];
      this.respuestaSeleccionada = null;
      this.mostrarVisorRespuesta = false;
      this.cargando = false;
      this.guardando = false;
      this.eliminandoRespuesta = null;
      this.error = '';
      this.errorPdf = '';

      this.limpiarFormulario();

      if (Number.isInteger(this.idExpediente) && this.idExpediente > 0) {
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

  get ocupado(): boolean {
    return (
      this.cargando ||
      this.guardando ||
      this.eliminandoRespuesta !== null
    );
  }

  cambiarPestana(numero: number): void {
    if (!this.ocupado && [1, 2].includes(numero)) {
      this.pestanaActiva = numero;
    }
  }

  cargarRespuestas(): void {
    if (!this.idExpediente || this.cargando) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.integridadService
      .listarRespuestasNivel4(this.idExpediente)
      .pipe(
        takeUntil(this.cambioCaso$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any[]) => {
          this.respuestas = Array.isArray(data) ? data : [];
          this.cargando = false;
          this.respuestasActualizadas.emit([...this.respuestas]);
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

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] || null;

    input.value = '';

    if (!archivo || this.ocupado) {
      return;
    }

    if (
      !archivo.name.toLowerCase().endsWith('.pdf') ||
      archivo.size === 0 ||
      archivo.size > 1024 * 1024 * 1024
    ) {
      this.advertir(
        'Adjunte un PDF con contenido y de máximo 1 GB.'
      );
      return;
    }

    this.archivoSeleccionado = archivo;
  }

  quitarArchivo(): void {
    if (!this.ocupado) {
      this.archivoSeleccionado = null;
    }
  }

  guardarRespuesta(): void {
    if (this.ocupado || this.error || !this.idExpediente) {
      return;
    }

    if (
      Number(this.denuncia?.nivelActual) !== 4 ||
      Number(this.denuncia?.nivelDestino) !== 4
    ) {
      this.advertir(
        'La denuncia debe estar en Integridad 4 con destino final Nivel 4.'
      );
      return;
    }

    const nombre = this.nombreDocumento.trim();

    const tipo = this.tipoDocumento === 'OTROS'
      ? this.otroTipoDocumento.trim()
      : this.tipoDocumento.trim();

    const descripcion = this.descripcion.trim();

    if (!nombre || !tipo || !this.fechaDocumento || !descripcion) {
      this.advertir(
        'Complete nombre, tipo, fecha y descripción de la respuesta.'
      );
      return;
    }

    if (
      nombre.length > 150 ||
      tipo.length > 100 ||
      descripcion.length > 2000
    ) {
      this.advertir(
        'Máximo: nombre 150, tipo 100 y descripción 2000 caracteres.'
      );
      return;
    }

    if (!this.archivoSeleccionado) {
      this.advertir('Adjunte el PDF de la respuesta.');
      return;
    }

    this.guardando = true;

    this.integridadService
      .guardarRespuestaNivel4(
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
            )
          });
        }
      });
  }

  abrirPdfRespuesta(respuesta: any): void {
    const id = Number(respuesta?.idRespuesta);

    if (!id || this.ocupado) {
      return;
    }

    this.liberarPdf();
    this.mostrarVisorRespuesta = true;
    this.respuestaSeleccionada = respuesta;
    this.cargandoPdf = true;
    this.errorPdf = '';

    const version = this.versionPdf;

    this.integridadService
      .verPdfRespuestaNivel4(this.idExpediente, id)
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
            new Blob([blob], { type: 'application/pdf' })
          );

          this.pdfUrl = this.sanitizer
            .bypassSecurityTrustResourceUrl(this.objectUrl);

          this.cargandoPdf = false;
        },
        error: (error: any) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.cargandoPdf = false;
          this.errorPdf = this.mensajeError(
            error,
            'No se pudo visualizar el PDF.'
          );
        }
      });
  }

  cerrarVisorRespuesta(): void {
    this.mostrarVisorRespuesta = false;
    this.respuestaSeleccionada = null;
    this.errorPdf = '';
    this.liberarPdf();
  }

  async eliminarRespuesta(respuesta: any): Promise<void> {
    const idRespuesta = Number(respuesta?.idRespuesta);

    if (!idRespuesta || this.ocupado) {
      return;
    }

    const version = this.versionCaso;
    const idExpediente = this.idExpediente;

    this.eliminandoRespuesta = idRespuesta;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar respuesta?',
      text: `Se retirará "${respuesta.nombreDocumento}" de las respuestas activas.`,
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
      .eliminarRespuestaNivel4(idExpediente, idRespuesta)
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
            confirmButtonText: 'Aceptar'
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
            )
          });
        }
      });
  }

  obtenerTamano(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cerrarModal(): void {
    if (this.ocupado) {
      return;
    }

    ++this.versionCaso;
    this.cambioCaso$.next();
    this.liberarPdf();
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

  private mensajeError(error: any, alternativo: string): string {
    const cuerpo = error?.error;

    return typeof cuerpo?.message === 'string'
      ? cuerpo.message
      : typeof cuerpo?.mensaje === 'string'
        ? cuerpo.mensaje
        : alternativo;
  }
}