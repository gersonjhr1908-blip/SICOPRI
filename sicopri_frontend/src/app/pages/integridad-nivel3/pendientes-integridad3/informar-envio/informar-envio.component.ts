import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { Subject, takeUntil } from 'rxjs';

import Swal from 'sweetalert2';

import { IntegridadService } from '../../../../services/integridad.service';

@Component({
  selector: 'app-informar-envio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informar-envio.component.html',
  styleUrl: './informar-envio.component.css',
})
export class InformarEnvioComponent implements OnChanges, OnDestroy {
  @Input() denuncia: any = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() informesActualizados = new EventEmitter<any[]>();

  pestanaActiva = 1;
  mostrarVisorInforme = false;

  nombreDocumento = '';
  tipoDocumento = '';
  otroTipoDocumento = '';
  fechaRegistro = this.fechaActual();

  readonly origen = 'Integridad - Nivel 3';

  archivoSeleccionado: File | null = null;

  informes: any[] = [];
  informeSeleccionado: any = null;

  cargando = false;
  guardando = false;
  eliminandoInforme = false;
  cargandoPdf = false;

  error = '';
  errorPdf = '';

  pdfUrl: SafeResourceUrl | null = null;

  private objectUrl: string | null = null;
  private versionPdf = 0;
  private destruido = false;

  private readonly destroy$ = new Subject<void>();
  private readonly cambioCaso$ = new Subject<void>();

  constructor(
    private integridadService: IntegridadService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['denuncia']) {
      this.cambioCaso$.next();
      this.liberarPdf();

      this.pestanaActiva = 1;
      this.mostrarVisorInforme = false;
      this.informes = [];
      this.informeSeleccionado = null;

      this.guardando = false;
      this.cargando = false;
      this.error = '';
      this.errorPdf = '';

      this.limpiarFormulario();

      if (this.idExpediente > 0) {
        this.cargarInformes();
      } else {
        this.error = 'No se encontró el expediente.';
      }
    }
  }

  ngOnDestroy(): void {
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

    if (!archivo || this.guardando) {
      return;
    }

    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
      this.advertir('El informe de envío solo admite PDF.');
      return;
    }

    if (archivo.size === 0 || archivo.size > 10 * 1024 * 1024) {
      this.advertir('El PDF debe tener contenido y no superar los 10 MB.');
      return;
    }

    this.archivoSeleccionado = archivo;
  }

  quitarArchivo(): void {
    if (!this.guardando) {
      this.archivoSeleccionado = null;
    }
  }

  cargarInformes(): void {
    this.cargando = true;
    this.error = '';

    this.integridadService
      .listarInformesEnvio(this.idExpediente)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          this.informes = Array.isArray(data) ? data : [];
          this.cargando = false;

          this.informesActualizados.emit([...this.informes]);

          this.mostrarVisorInforme = false;
          this.informeSeleccionado = null;
          this.liberarPdf();
        },
        error: (err: any) => {
          this.cargando = false;
          this.error = this.mensajeError(
            err,
            'No se pudieron consultar los informes de envío.',
          );
        },
      });
  }

  guardarInforme(): void {
    if (this.guardando || this.cargando || this.error || !this.idExpediente) {
      return;
    }

    if (Number(this.denuncia?.nivelDestino) !== 4) {
      this.advertir(
        'El informe de envío corresponde a casos con destino final Nivel 4.',
      );
      return;
    }

    const nombre = this.nombreDocumento.trim();

    const tipo =
      this.tipoDocumento === 'OTROS'
        ? this.otroTipoDocumento.trim()
        : this.tipoDocumento.trim();

    if (nombre.length > 150 || tipo.length > 100) {
      this.advertir(
        'El nombre admite hasta 150 caracteres y el tipo hasta 100.',
      );
      return;
    }

    if (!nombre || !tipo || !this.fechaRegistro) {
      this.advertir('Complete nombre del documento, tipo y fecha.');
      return;
    }

    if (!this.archivoSeleccionado) {
      this.advertir('Adjunte el PDF del informe.');
      return;
    }

    this.guardando = true;

    const datos = {
      nombreDocumento: nombre,
      tipoDocumento: tipo,
      fechaRegistro: this.fechaRegistro,
    };

    this.integridadService
      .guardarInformeEnvio(this.idExpediente, datos, this.archivoSeleccionado)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.limpiarFormulario();
          this.pestanaActiva = 2;
          this.cargarInformes();

          void Swal.fire({
            icon: 'success',
            title: 'Informe guardado',
            text: 'El informe de envío fue registrado.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#145c43',
          });
        },
        error: (err: any) => {
          this.guardando = false;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar',
            text: this.mensajeError(
              err,
              'No se pudo registrar el informe de envío.',
            ),
          });
        },
      });
  }

  async eliminarInforme(informe: any): Promise<void> {
    const idExpediente = this.idExpediente;
    const idInforme = Number(informe?.idInforme);

    if (
      !idExpediente ||
      !idInforme ||
      this.guardando ||
      this.cargando ||
      this.eliminandoInforme
    ) {
      return;
    }

    this.eliminandoInforme = true;

    const resultado = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar informe de envío?',
      text: `Se retirará "${informe.nombreDocumento}" de los informes activos.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#b42318',
    });

    if (
      !resultado.isConfirmed ||
      this.destruido ||
      idExpediente !== this.idExpediente
    ) {
      this.eliminandoInforme = false;
      return;
    }

    this.integridadService
      .eliminarInformeEnvio(idExpediente, idInforme)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.eliminandoInforme = false;
          this.cerrarVisorInforme();
          this.cargarInformes();

          void Swal.fire({
            icon: 'success',
            title: 'Informe eliminado',
            text: 'El informe fue retirado de la lista.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#145c43',
          });
        },
        error: (error: any) => {
          this.eliminandoInforme = false;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: this.mensajeError(
              error,
              'No se pudo eliminar el informe de envío.',
            ),
          });
        },
      });
  }

  abrirVisorInforme(informe: any): void {
    if (!Number(informe?.idInforme)) {
      return;
    }

    this.mostrarVisorInforme = true;
    this.verInforme(informe);
  }

  cerrarVisorInforme(): void {
    this.mostrarVisorInforme = false;
    this.informeSeleccionado = null;
    this.errorPdf = '';
    this.liberarPdf();
  }

  verInforme(informe: any): void {
    const idInforme = Number(informe?.idInforme);

    if (!idInforme) {
      return;
    }

    this.liberarPdf();
    this.informeSeleccionado = informe;
    this.errorPdf = '';
    this.cargandoPdf = true;

    const version = this.versionPdf;

    this.integridadService
      .verPdfInformeEnvio(this.idExpediente, idInforme)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.objectUrl = URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' }),
          );

          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.objectUrl,
          );

          this.cargandoPdf = false;
        },
        error: (err: any) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.cargandoPdf = false;
          this.errorPdf = this.mensajeError(
            err,
            'No se pudo visualizar el PDF.',
          );
        },
      });
  }

  obtenerTamano(bytes: number): string {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cerrarModal(): void {
    if (this.guardando || this.eliminandoInforme) {
      return;
    }

    this.cambioCaso$.next();
    this.liberarPdf();
    this.cerrar.emit();
  }

  private limpiarFormulario(): void {
    this.nombreDocumento = '';
    this.tipoDocumento = '';
    this.otroTipoDocumento = '';
    this.fechaRegistro = this.fechaActual();
    this.archivoSeleccionado = null;
  }

  private fechaActual(): string {
    const fecha = new Date();

    return [
      fecha.getFullYear(),
      String(fecha.getMonth() + 1).padStart(2, '0'),
      String(fecha.getDate()).padStart(2, '0'),
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
      confirmButtonColor: '#145c43',
    });
  }

  private mensajeError(error: any, alternativo: string): string {
    const cuerpo = error?.error;

    return typeof cuerpo?.message === 'string'
      ? cuerpo.message
      : typeof cuerpo?.mensaje === 'string'
        ? cuerpo.mensaje
        : typeof cuerpo === 'string' && cuerpo.trim()
          ? cuerpo
          : alternativo;
  }
}
