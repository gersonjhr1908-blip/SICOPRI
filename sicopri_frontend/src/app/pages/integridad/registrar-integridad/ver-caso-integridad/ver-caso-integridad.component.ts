import { TemplateRef } from '@angular/core';
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
import { ExpedienteService } from '../../../../services/expediente.service';
import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad,
} from '../../../../services/users.service';

@Component({
  selector: 'app-ver-caso-integridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-caso-integridad.component.html',
  styleUrl: './ver-caso-integridad.component.css',
})
export class VerCasoIntegridadComponent implements OnChanges, OnDestroy {
  @Input() editorInspectoria: TemplateRef<{ $implicit: string }> | null = null;

  mostrarRespuestasRecibidas = false;
  respuestasRecibidas: any[] = [];
  tipoDocumentoRecibido: 'respuestas' | 'informes' = 'respuestas';

  get tituloDocumentosRecibidos(): string {
    return this.tipoDocumentoRecibido === 'informes'
      ? 'INFORMES DE ENVÍO — INTEGRIDAD NIVEL 3'
      : 'RESPUESTAS RECIBIDAS';
  }
  cargandoRespuestasRecibidas = false;
  errorRespuestasRecibidas = '';

  @Input() denuncia: any = null;
  @Input() soloLectura = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() enviado = new EventEmitter<void>();

  detalle: any = null;

  cargandoDetalle = false;
  errorDetalle = '';

  tabActivo = 'registrado';
  mostrarDatosPersona = true;

  nombreNucleo = '';
  nombreBrigada = '';
  nombreUnidad = '';
  nombreNucleoIg = '';
  nombreIg = '';
  guarnicionUnidad = '';

  archivos: any[] = [];
  archivoSeleccionado: any = null;

  pdfUrl: SafeResourceUrl | null = null;
  objectUrlActual: string | null = null;

  cargandoArchivos = false;
  cargandoPdf = false;
  descargandoArchivo = false;
  errorArchivos = '';

  seguimientoActivo = false;
  seguimientoGuardado = false;

  fechaInicioSeguimiento = '';
  fechaFinSeguimiento = '';
  cantidadDiasSeguimiento = 0;

  cargandoSeguimiento = false;
  guardandoSeguimiento = false;

  observacionActual = '';
  guardandoObservacion = false;
  observacionGuardada = false;
  errorObservacion = '';

  enviando = false;

  private temporizadorObservacion: ReturnType<typeof setTimeout> | null = null;

  private observacionPersistida = '';
  errorSeguimiento = '';
  mensajeSeguimiento = '';

  private seguimientoCargado = false;
  private fechaInicioGuardada = '';
  private fechaFinGuardada = '';

  private versionPdf = 0;

  private readonly destroy$ = new Subject<void>();
  private readonly cambioCaso$ = new Subject<void>();

  cambioObservacion(): void {
    if (this.soloLectura) {
      return;
    }

    this.observacionGuardada = false;
    this.errorObservacion = '';

    this.cancelarTemporizadorObservacion();

    this.temporizadorObservacion = setTimeout(() => {
      this.temporizadorObservacion = null;
      this.guardarObservacion();
    }, 900);
  }

  guardarObservacion(): void {
    if (
      this.soloLectura ||
      this.guardandoObservacion ||
      this.cargandoDetalle ||
      this.errorDetalle ||
      !this.detalle ||
      !this.idExpediente
    ) {
      return;
    }

    const observacion = this.observacionActual;

    if (observacion.length > 2000) {
      this.errorObservacion = 'La observación admite máximo 2000 caracteres.';
      return;
    }

    if (observacion === this.observacionPersistida) {
      return;
    }

    this.guardandoObservacion = true;
    this.observacionGuardada = false;
    this.errorObservacion = '';

    this.expedienteService
      .actualizarObservacion(this.idExpediente, observacion)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta: any) => {
          this.guardandoObservacion = false;

          this.observacionPersistida = String(
            respuesta?.observacionActual ?? observacion,
          );

          this.detalle.observacionActual = this.observacionPersistida;

          this.observacionGuardada =
            this.observacionActual === this.observacionPersistida;

          // Si escribió mientras se guardaba, guarda
          // después el texto más reciente.
          if (
            this.observacionActual !== this.observacionPersistida &&
            this.temporizadorObservacion === null
          ) {
            this.cambioObservacion();
          }
        },
        error: (error: any) => {
          this.guardandoObservacion = false;

          this.errorObservacion = this.obtenerMensajeError(
            error,
            'No se pudo guardar la observación.',
          );
        },
      });
  }

  private cancelarTemporizadorObservacion(): void {
    if (this.temporizadorObservacion !== null) {
      clearTimeout(this.temporizadorObservacion);
      this.temporizadorObservacion = null;
    }
  }

  constructor(
    private integridadService: IntegridadService,
    private expedienteService: ExpedienteService,
    private usersService: UsersService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['denuncia']) {
      this.inicializarCaso();
    }
  }

  ngOnDestroy(): void {
    this.cancelarTemporizadorObservacion();
    this.cambioCaso$.next();
    this.cambioCaso$.complete();

    this.destroy$.next();
    this.destroy$.complete();

    this.liberarPdf();
  }

  get idExpediente(): number {
    return Number(this.denuncia?.idExpediente || 0);
  }

  get datosPersona(): any {
    const persona = this.detalle?.datosPersona;

    return {
      nombres: persona?.nombres ?? null,
      apellidos: persona?.apellidos ?? null,
      ruc: persona?.ruc ?? null,
      dni: persona?.dni ?? this.detalle?.dni ?? null,
      telefono: persona?.telefono ?? this.detalle?.telefono ?? null,
      domicilio: persona?.domicilio ?? null,
      correo: persona?.correo ?? this.detalle?.correo ?? null,
      situacion: persona?.situacion ?? null,
    };
  }

  inicializarCaso(): void {
    this.mostrarRespuestasRecibidas = false;
    this.respuestasRecibidas = [];
    this.cargandoRespuestasRecibidas = false;
    this.errorRespuestasRecibidas = '';
    this.enviando = false;
    this.cancelarTemporizadorObservacion();
    this.observacionPersistida = '';
    this.cambioCaso$.next();
    this.liberarPdf();

    this.detalle = null;
    this.tabActivo = 'registrado';
    this.mostrarDatosPersona = true;

    this.observacionActual = '';
    this.guardandoObservacion = false;
    this.observacionGuardada = false;
    this.errorObservacion = '';

    this.cargandoDetalle = false;
    this.errorDetalle = '';

    this.nombreNucleo = '';
    this.nombreBrigada = '';
    this.nombreUnidad = '';
    this.nombreNucleoIg = '';
    this.nombreIg = '';
    this.guarnicionUnidad = '';

    this.archivos = [];
    this.archivoSeleccionado = null;

    this.cargandoArchivos = false;
    this.cargandoPdf = false;
    this.descargandoArchivo = false;
    this.errorArchivos = '';

    this.seguimientoActivo = false;
    this.seguimientoGuardado = false;
    this.seguimientoCargado = false;

    this.fechaInicioSeguimiento = '';
    this.fechaFinSeguimiento = '';
    this.cantidadDiasSeguimiento = 0;

    this.fechaInicioGuardada = '';
    this.fechaFinGuardada = '';

    this.cargandoSeguimiento = false;
    this.guardandoSeguimiento = false;

    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    if (!Number.isInteger(this.idExpediente) || this.idExpediente <= 0) {
      this.errorDetalle = 'No se pudo identificar el expediente.';
      return;
    }

    this.cargarDetalle();
    this.cargarArchivos();
    this.cargarSeguimiento();
  }

  cargarDetalle(): void {
    this.cargandoDetalle = true;
    this.errorDetalle = '';

    this.integridadService
      .obtenerDetalle(this.idExpediente)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.cargandoDetalle = false;

          if (!response) {
            this.errorDetalle = 'No se recibió la información del caso.';
            return;
          }

          this.detalle = response;
          this.observacionActual = String(response.observacionActual ?? '');
          this.observacionPersistida = this.observacionActual;
          this.cargarNombresUbicacion();
        },
        error: (error: any) => {
          this.cargandoDetalle = false;

          this.errorDetalle = this.obtenerMensajeError(
            error,
            'No se pudo cargar la información del caso.',
          );
        },
      });
  }

  cargarNombresUbicacion(): void {
    const datos = {
      ...this.denuncia,
      ...this.detalle,
    };

    const nucleo = String(datos.idNucleo ?? '');
    const brigada = String(datos.idBrigada ?? '');
    const unidad = String(datos.idUnidad ?? '');
    const nucleoIg = String(datos.idNucleoIg ?? '');
    const ig = String(datos.idIg ?? '');

    this.nombreNucleo = nucleo;
    this.nombreBrigada = brigada;
    this.nombreUnidad = unidad;
    this.nombreNucleoIg = nucleoIg;
    this.nombreIg = ig;

    if (nucleo || nucleoIg) {
      this.usersService
        .getNucleos()
        .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.nombreNucleo =
              (data || []).find((item) => String(item.idNucleo) === nucleo)
                ?.nombre || nucleo;

            this.nombreNucleoIg =
              (data || []).find((item) => String(item.idNucleo) === nucleoIg)
                ?.nombre || nucleoIg;
          },
          error: () => {},
        });
    }

    if (nucleo && brigada) {
      this.usersService
        .getBrigadas(nucleo)
        .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.nombreBrigada =
              (data || []).find((item) => String(item.idBrigada) === brigada)
                ?.nombre || brigada;
          },
          error: () => {},
        });
    }

    if (nucleo && brigada && unidad) {
      this.usersService
        .getUnidades(nucleo, brigada)
        .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            const seleccionada = (data || []).find(
              (item) => String(item.idUnidad) === unidad,
            );

            this.nombreUnidad = seleccionada?.nombre || unidad;

            this.guarnicionUnidad = String(
              seleccionada?.guarnicion || '',
            ).trim();
          },
          error: () => {},
        });
    }

    if (nucleoIg && ig) {
      this.usersService
        .getBrigadas(nucleoIg)
        .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.nombreIg =
              (data || []).find((item) => String(item.idBrigada) === ig)
                ?.nombre || ig;
          },
          error: () => {},
        });
    }
  }

  obtenerNombreNucleoIg(): string {
    if (!this.nombreNucleoIg) {
      return '-';
    }

    return this.guarnicionUnidad
      ? `${this.nombreNucleoIg} - ${this.guarnicionUnidad}`
      : this.nombreNucleoIg;
  }

  obtenerDestino(): string {
    const destino = Number(
      this.detalle?.nivelDestino ?? this.denuncia?.nivelDestino,
    );

    if (destino === 3 || destino === 4) {
      return `Inspectoría Integridad - Nivel ${destino}`;
    }

    return '-';
  }

  cambiarTab(tab: string): void {
    if (!['registrado', 'adjunto', 'seguimiento'].includes(tab)) {
      return;
    }

    this.tabActivo = tab;
  }

  cargarArchivos(): void {
    this.cargandoArchivos = true;
    this.errorArchivos = '';

    this.expedienteService
      .listarArchivosExpediente(this.idExpediente)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.archivos = Array.isArray(response) ? response : [];

          this.cargandoArchivos = false;

          if (this.archivos.length > 0) {
            this.seleccionarArchivo(this.archivos[0]);
          }
        },
        error: (error: any) => {
          this.cargandoArchivos = false;

          this.errorArchivos = this.obtenerMensajeError(
            error,
            'No se pudieron cargar los adjuntos.',
          );
        },
      });
  }

  esZip(archivo: any): boolean {
    return String(archivo?.nombreArchivo || archivo?.nombreGuardado || '')
      .toLowerCase()
      .endsWith('.zip');
  }

  obtenerTipoArchivo(archivo: any): string {
    return this.esZip(archivo) ? 'ZIP' : 'PDF';
  }

  seleccionarArchivo(archivo: any): void {
    if (!archivo?.idArchivo) {
      return;
    }

    this.liberarPdf();

    this.archivoSeleccionado = archivo;
    this.errorArchivos = '';

    if (this.esZip(archivo)) {
      return;
    }

    const version = this.versionPdf;

    this.cargandoPdf = true;

    this.expedienteService
      .verArchivo(Number(archivo.idArchivo))
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.objectUrlActual = URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' }),
          );

          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.objectUrlActual,
          );

          this.cargandoPdf = false;
        },
        error: (error: any) => {
          if (version !== this.versionPdf) {
            return;
          }

          this.cargandoPdf = false;

          this.errorArchivos = this.obtenerMensajeError(
            error,
            'No se pudo visualizar el PDF.',
          );
        },
      });
  }

  descargarZip(archivo: any): void {
    if (
      !archivo?.idArchivo ||
      !this.esZip(archivo) ||
      this.descargandoArchivo
    ) {
      return;
    }

    this.descargandoArchivo = true;

    this.expedienteService
      .verArchivo(Number(archivo.idArchivo))
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          this.descargandoArchivo = false;

          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');

          enlace.href = url;
          enlace.download = archivo.nombreArchivo || 'adjunto.zip';

          document.body.appendChild(enlace);
          enlace.click();
          enlace.remove();

          setTimeout(() => URL.revokeObjectURL(url), 30000);
        },
        error: (error: any) => {
          this.descargandoArchivo = false;

          void Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.obtenerMensajeError(
              error,
              'No se pudo descargar el ZIP.',
            ),
          });
        },
      });
  }

  liberarPdf(): void {
    ++this.versionPdf;

    if (this.objectUrlActual) {
      URL.revokeObjectURL(this.objectUrlActual);
    }

    this.objectUrlActual = null;
    this.pdfUrl = null;
    this.cargandoPdf = false;
  }

  cargarSeguimiento(): void {
    this.cargandoSeguimiento = true;
    this.seguimientoCargado = false;
    this.errorSeguimiento = '';

    this.expedienteService
      .obtenerSeguimiento(this.idExpediente)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta: any) => {
          this.cargandoSeguimiento = false;
          this.seguimientoCargado = true;

          const seguimiento = respuesta?.seguimiento ?? respuesta;

          if (seguimiento?.fechaInicio && seguimiento?.fechaFin) {
            this.aplicarSeguimiento(seguimiento);
          }
        },
        error: (error: any) => {
          this.cargandoSeguimiento = false;

          this.errorSeguimiento = this.obtenerMensajeError(
            error,
            'No se pudo consultar el seguimiento.',
          );
        },
      });
  }

  iniciarSeguimiento(): void {
    if (
      this.soloLectura ||
      this.cargandoSeguimiento ||
      this.guardandoSeguimiento ||
      !this.seguimientoCargado
    ) {
      return;
    }

    this.seguimientoActivo = true;
    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';
  }

  editarSeguimiento(): void {
    this.iniciarSeguimiento();
  }

  cancelarSeguimiento(): void {
    if (this.guardandoSeguimiento) {
      return;
    }

    this.fechaInicioSeguimiento = this.fechaInicioGuardada;
    this.fechaFinSeguimiento = this.fechaFinGuardada;

    this.calcularDiasSeguimiento();

    this.seguimientoActivo = false;
    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';
  }

  calcularDiasSeguimiento(): void {
    const inicio = this.fechaInicioSeguimiento;
    const fin = this.fechaFinSeguimiento;

    if (!inicio || !fin || fin < inicio) {
      this.cantidadDiasSeguimiento = 0;
      return;
    }

    const inicioUtc = Date.parse(`${inicio}T00:00:00Z`);
    const finUtc = Date.parse(`${fin}T00:00:00Z`);

    this.cantidadDiasSeguimiento =
      Number.isFinite(inicioUtc) && Number.isFinite(finUtc)
        ? Math.floor((finUtc - inicioUtc) / 86400000)
        : 0;
  }

  guardarSeguimiento(): void {
    if (
      this.soloLectura ||
      !this.seguimientoActivo ||
      !this.seguimientoCargado ||
      this.cargandoSeguimiento ||
      this.guardandoSeguimiento
    ) {
      return;
    }

    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    const inicio = this.fechaInicioSeguimiento;
    const fin = this.fechaFinSeguimiento;

    if (!inicio || !fin) {
      this.errorSeguimiento = 'Seleccione las fechas de inicio y fin.';
      return;
    }

    if (fin < inicio) {
      this.errorSeguimiento =
        'La fecha de fin no puede ser anterior a la de inicio.';
      return;
    }

    this.calcularDiasSeguimiento();

    const esEdicion = this.seguimientoGuardado;

    const peticion = esEdicion
      ? this.expedienteService.actualizarSeguimiento(
          this.idExpediente,
          inicio,
          fin,
        )
      : this.expedienteService.guardarSeguimiento(
          this.idExpediente,
          inicio,
          fin,
        );

    this.guardandoSeguimiento = true;

    peticion
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta: any) => {
          this.guardandoSeguimiento = false;

          const seguimiento = respuesta?.seguimiento ?? respuesta ?? {};

          this.aplicarSeguimiento({
            ...seguimiento,
            fechaInicio: seguimiento.fechaInicio ?? inicio,
            fechaFin: seguimiento.fechaFin ?? fin,
          });

          this.mensajeSeguimiento = esEdicion
            ? 'Seguimiento actualizado correctamente.'
            : 'Seguimiento guardado correctamente.';
        },
        error: (error: any) => {
          this.guardandoSeguimiento = false;

          this.errorSeguimiento = this.obtenerMensajeError(
            error,
            'No se pudo guardar el seguimiento.',
          );
        },
      });
  }

  private aplicarSeguimiento(seguimiento: any): void {
    this.fechaInicioSeguimiento = String(seguimiento.fechaInicio || '').slice(
      0,
      10,
    );

    this.fechaFinSeguimiento = String(seguimiento.fechaFin || '').slice(0, 10);

    this.calcularDiasSeguimiento();

    this.fechaInicioGuardada = this.fechaInicioSeguimiento;
    this.fechaFinGuardada = this.fechaFinSeguimiento;

    this.seguimientoGuardado = true;
    this.seguimientoActivo = false;
  }

  obtenerMotivoCompleto(motivo: string): string {
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

    return motivos[motivo] || motivo || '-';
  }

  obtenerProteccionCompleta(valor: string): string {
    const medidas: Record<string, string> = {
      RESERVA_IDENTIDAD: 'Reserva de identidad',
      PROTECCION_LABORAL: 'Protección laboral',
      POSTOR: 'Protección como postor en contratación pública',
      NINGUNA: 'No solicita medidas de protección',
    };

    return medidas[valor] || valor || '-';
  }

  mostrarValor(valor: any): string {
    return valor === null || valor === undefined || String(valor).trim() === ''
      ? '-'
      : String(valor);
  }

  obtenerTamanoArchivo(bytes: number): string {
    if (!bytes) {
      return '0 KB';
    }

    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  get casoFinalizado(): boolean {
    const estado = Number(this.detalle?.idEstado ?? this.denuncia?.idEstado);

    return estado === 4 || estado === 5;
  }

  abrirRespuestasRecibidas(): void {
    this.consultarDocumentosRecibidos('respuestas');
  }

  abrirInformesRecibidos(): void {
    this.consultarDocumentosRecibidos('informes');
  }

  private consultarDocumentosRecibidos(tipo: 'respuestas' | 'informes'): void {
    if (!this.idExpediente || this.cargandoRespuestasRecibidas) {
      return;
    }

    this.tipoDocumentoRecibido = tipo;
    this.mostrarRespuestasRecibidas = true;
    this.respuestasRecibidas = [];
    this.cargandoRespuestasRecibidas = true;
    this.errorRespuestasRecibidas = '';

    const destino = Number(
      this.detalle?.nivelDestino ?? this.denuncia?.nivelDestino,
    );

    const consulta =
      tipo === 'informes'
        ? this.integridadService.listarInformesEnvio(this.idExpediente)
        : destino === 4
          ? this.integridadService.listarRespuestasNivel4(this.idExpediente)
          : this.integridadService.listarRespuestasNivel3(this.idExpediente);

    consulta
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (data: any[]) => {
          const documentos = Array.isArray(data) ? data : [];

          this.respuestasRecibidas = documentos.map((documento: any) => ({
            ...documento,
            fechaDocumento:
              tipo === 'informes'
                ? documento.fechaRegistro
                : documento.fechaDocumento,
          }));

          this.cargandoRespuestasRecibidas = false;
        },
        error: (error: any) => {
          this.cargandoRespuestasRecibidas = false;

          this.errorRespuestasRecibidas = this.obtenerMensajeError(
            error,
            'No se pudieron consultar los documentos.',
          );
        },
      });
  }

  cerrarRespuestasRecibidas(): void {
    this.mostrarRespuestasRecibidas = false;
  }

  verPdfRespuestaRecibida(documento: any): void {
    const esInforme = this.tipoDocumentoRecibido === 'informes';

    const idDocumento = Number(
      esInforme ? documento?.idInforme : documento?.idRespuesta,
    );

    if (!this.idExpediente || !idDocumento) {
      return;
    }

    const destino = Number(
      this.detalle?.nivelDestino ?? this.denuncia?.nivelDestino,
    );

    const ventana = window.open('about:blank', '_blank');

    if (!ventana) {
      void Swal.fire({
        icon: 'info',
        title: 'Ventana bloqueada',
        text: 'Permita las ventanas emergentes para visualizar el PDF.',
      });
      return;
    }

    ventana.opener = null;
    let pdfAbierto = false;

    const consulta = esInforme
      ? this.integridadService.verPdfInformeEnvio(
          this.idExpediente,
          idDocumento,
        )
      : destino === 4
        ? this.integridadService.verPdfRespuestaNivel4(
            this.idExpediente,
            idDocumento,
          )
        : this.integridadService.verPdfRespuestaNivel3(
            this.idExpediente,
            idDocumento,
          );

    consulta
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: (archivo: Blob) => {
          if (ventana.closed) {
            return;
          }

          const url = URL.createObjectURL(
            new Blob([archivo], { type: 'application/pdf' }),
          );

          ventana.location.replace(url);
          pdfAbierto = true;

          setTimeout(() => URL.revokeObjectURL(url), 60000);
        },
        error: (error: any) => {
          ventana.close();

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo abrir el PDF',
            text: this.obtenerMensajeError(
              error,
              'No se pudo consultar el documento.',
            ),
          });
        },
        complete: () => {
          if (!pdfAbierto && !ventana.closed) {
            ventana.close();
          }
        },
      });
  }

  async enviarANivel3(): Promise<void> {
    if (
      this.soloLectura ||
      this.casoFinalizado ||
      this.enviando ||
      this.cargandoDetalle ||
      !this.detalle ||
      this.errorDetalle ||
      this.guardandoSeguimiento
    ) {
      return;
    }

    if (this.cargandoSeguimiento) {
      this.tabActivo = 'seguimiento';

      void Swal.fire({
        icon: 'info',
        title: 'Consultando seguimiento',
        text: 'Espere a que termine la consulta.',
      });

      return;
    }

    if (!this.seguimientoGuardado || this.seguimientoActivo) {
      this.tabActivo = 'seguimiento';

      void Swal.fire({
        icon: 'warning',
        title: 'Seguimiento requerido',
        text: this.seguimientoActivo
          ? 'Guarde o cancele los cambios del seguimiento antes de enviar.'
          : 'Registre y guarde el seguimiento antes de enviar la denuncia.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#145c43',
      });

      return;
    }

    if (
      this.guardandoObservacion ||
      this.observacionActual !== this.observacionPersistida
    ) {
      this.cancelarTemporizadorObservacion();
      this.guardarObservacion();

      void Swal.fire({
        icon: 'info',
        title: 'Guardando observación',
        text: 'Espere a que aparezca Guardado y vuelva a enviar.',
        confirmButtonText: 'Aceptar',
      });

      return;
    }

    const destino = Number(this.detalle.nivelDestino);

    if (![3, 4].includes(destino)) {
      void Swal.fire({
        icon: 'warning',
        title: 'Destino requerido',
        text: 'La denuncia debe tener un destino final válido.',
      });
      return;
    }

    const id = this.idExpediente;

    this.enviando = true;

    const resultado = await Swal.fire({
      icon: 'question',
      title: '¿Enviar a Integridad Nivel 3?',
      text:
        destino === 4
          ? 'El caso llegará al Nivel 3 para preparar el informe de pase al Nivel 4.'
          : 'El caso llegará al Nivel 3 para su atención y respuesta.',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#145c43',
    });

    if (!resultado.isConfirmed || id !== this.idExpediente) {
      this.enviando = false;
      return;
    }

    this.integridadService
      .enviarANivel3(id)
      .pipe(takeUntil(this.cambioCaso$), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.enviando = false;

          void Swal.fire({
            icon: 'success',
            title: 'Denuncia enviada',
            text: 'El caso fue enviado a Integridad Nivel 3.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#145c43',
          });

          this.enviado.emit();
          this.salir();
        },
        error: (error: any) => {
          this.enviando = false;

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar',
            text: this.obtenerMensajeError(
              error,
              'No se pudo enviar la denuncia.',
            ),
          });
        },
      });
  }

  salir(): void {
    if (this.guardandoSeguimiento || this.guardandoObservacion) {
      return;
    }

    if (
      !this.soloLectura &&
      this.detalle &&
      this.observacionActual !== this.observacionPersistida
    ) {
      this.cancelarTemporizadorObservacion();
      this.guardarObservacion();
      return;
    }

    if (
      this.enviando ||
      this.guardandoSeguimiento ||
      this.guardandoObservacion
    ) {
      return;
    }

    this.cancelarTemporizadorObservacion();
    this.cambioCaso$.next();
    this.liberarPdf();
    this.cerrar.emit();
  }

  private obtenerMensajeError(error: any, alternativo: string): string {
    const cuerpo = error?.error;

    if (typeof cuerpo?.message === 'string') {
      return cuerpo.message;
    }

    if (typeof cuerpo?.mensaje === 'string') {
      return cuerpo.mensaje;
    }

    if (typeof cuerpo === 'string' && cuerpo.trim()) {
      return cuerpo;
    }

    return alternativo;
  }
}

