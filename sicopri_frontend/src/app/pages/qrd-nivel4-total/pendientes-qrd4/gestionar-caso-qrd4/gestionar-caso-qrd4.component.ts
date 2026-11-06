import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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

import { ExpedienteService } from '../../../../services/expediente.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad,
} from '../../../../services/users.service';

@Component({
  selector: 'app-gestionar-caso-qrd4',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './gestionar-caso-qrd4.component.html',

  styleUrl: './gestionar-caso-qrd4.component.css',
})
export class GestionarCasoQrd4Component implements OnChanges, OnDestroy {
  // =========================================
  // EXPEDIENTE
  // =========================================

  @Input()
  expediente: any = null;

  // Se activa únicamente desde Pendientes QRD4.
  @Input()
  modoGestion: boolean = false;

  // Se usa desde Listado Total: permite consultar el caso sin modificarlo.
  @Input()
  soloLectura: boolean = false;

  // =========================================
  // OUTPUTS
  // =========================================

  @Output()
  cerrar = new EventEmitter<void>();

  @Output()
  devolverDocumento = new EventEmitter<any>();

  @Output()
  darRespuesta = new EventEmitter<any>();

  // =========================================
  // PESTAÑA
  //
  // 1 = DOC REGISTRADO
  // 2 = DOC ADJUNTO
  // 3 = SEGUIMIENTO (SOLO QRD NIVEL 2)
  // =========================================

  pestanaActiva: number = 1;

  // =========================================
  // CATÁLOGOS / NOMBRES
  // =========================================

  nombreTipoDocumento: string = '';

  nombreTipificacion: string = '';

  // =========================================
  // UBICACIÓN NORMAL
  // =========================================

  nombreNucleo: string = '';

  nombreBrigada: string = '';

  nombreUnidad: string = '';

  guarnicionUnidad: string = '';

  // =========================================
  // UBICACIÓN INSPECTORÍA
  // =========================================

  nombreNucleoIg: string = '';

  nombreIg: string = '';

  // =========================================
  // OBSERVACIÓN / INDICACIONES
  // =========================================

  observacionActual: string = '';

  guardandoObservacion: boolean = false;

  observacionGuardada: boolean = false;

  errorObservacion: string = '';

  private temporizadorObservacion: any = null;

  // =========================================
  // DESTINO FINAL - GESTIÓN QRD4
  // =========================================

  nivelDestinoSeleccionado: number | null = null;

  destinoGuardado: boolean = false;

  guardandoDestino: boolean = false;

  errorDestino: string = '';

  // =========================================
  // SEGUIMIENTO - SOLO QRD NIVEL 2
  //
  // NOTA:
  // El frontend queda preparado con la UI.
  // La persistencia definitiva se conectará
  // al backend de seguimiento.
  // =========================================

  seguimientoActivo: boolean = false;

  seguimientoGuardado: boolean = false;

  fechaInicioSeguimiento: string = '';

  fechaFinSeguimiento: string = '';

  cantidadDiasSeguimiento: number = 0;

  private fechaInicioSeguimientoGuardada: string = '';

  private fechaFinSeguimientoGuardada: string = '';

  private cantidadDiasSeguimientoGuardada: number = 0;

  cargandoSeguimiento: boolean = false;

  guardandoSeguimiento: boolean = false;

  errorSeguimiento: string = '';

  mensajeSeguimiento: string = '';
  // =========================================
  // PDFs
  // =========================================

  archivos: any[] = [];

  archivoSeleccionado: any = null;

  pdfUrl: SafeResourceUrl | null = null;

  private objectUrlActual: string | null = null;

  // =========================================
  // ESTADOS
  // =========================================

  cargandoArchivos: boolean = false;

  cargandoPdf: boolean = false;

  archivosCargados: boolean = false;

  errorArchivos: string = '';

  respuestaIniciada = false;

  mostrarDatosPersona = false;

  readonly camposPersona = [
    { clave: 'nombres', etiqueta: 'NOMBRES' },
    { clave: 'apellidos', etiqueta: 'APELLIDOS' },
    { clave: 'ruc', etiqueta: 'RUC' },
    { clave: 'dni', etiqueta: 'DNI' },
    { clave: 'telefono', etiqueta: 'TELÉFONO' },
    { clave: 'domicilio', etiqueta: 'DOMICILIO' },
    { clave: 'correo', etiqueta: 'CORREO ELECTRÓNICO' },
    { clave: 'situacion', etiqueta: 'SITUACIÓN DE LA PERSONA' },
  ];

  obtenerDatoPersona(clave: string): string {
    const valor = this.expediente?.datosPersona?.[clave];

    return String(valor ?? '').trim() || 'No registrado';
  }
  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private expedienteService: ExpedienteService,

    private usersService: UsersService,

    private sanitizer: DomSanitizer,
  ) {}

  // =========================================
  // CAMBIO DE EXPEDIENTE
  // =========================================

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expediente'] && this.expediente) {
      this.inicializarCaso();
    }
  }

  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {
    this.limpiarPdf();

    if (this.temporizadorObservacion) {
      clearTimeout(this.temporizadorObservacion);
    }
  }

  // =========================================
  // INICIALIZAR
  // =========================================

  inicializarCaso(): void {
    const persona = this.expediente?.datosPersona;

    this.mostrarDatosPersona =
      !!persona &&
      Object.values(persona).some((valor) => String(valor ?? '').trim() !== '');
    this.respuestaIniciada = false;

    this.pestanaActiva = 1;

    this.nombreTipoDocumento = '';

    this.nombreTipificacion = '';

    this.nombreNucleo = '';

    this.nombreBrigada = '';

    this.nombreUnidad = '';

    this.guarnicionUnidad = '';

    this.nombreNucleoIg = '';

    this.nombreIg = '';

    // OBSERVACIÓN / INDICACIONES
    this.observacionActual = String(this.expediente?.observacionActual || '');

    this.guardandoObservacion = false;
    this.observacionGuardada = false;
    this.errorObservacion = '';

    this.nivelDestinoSeleccionado = [3, 4].includes(
      Number(this.expediente?.nivelDestino),
    )
      ? Number(this.expediente?.nivelDestino)
      : null;

    this.destinoGuardado = this.nivelDestinoSeleccionado !== null;

    this.guardandoDestino = false;
    this.errorDestino = '';

    // SEGUIMIENTO
    this.seguimientoActivo = false;
    this.seguimientoGuardado = false;
    this.fechaInicioSeguimiento = '';
    this.fechaFinSeguimiento = '';
    this.cantidadDiasSeguimiento = 0;
    this.fechaInicioSeguimientoGuardada = '';
    this.fechaFinSeguimientoGuardada = '';
    this.cantidadDiasSeguimientoGuardada = 0;
    this.cargandoSeguimiento = false;
    this.guardandoSeguimiento = false;
    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';
    this.archivos = [];

    this.archivoSeleccionado = null;

    this.archivosCargados = false;

    this.cargandoArchivos = false;

    this.cargandoPdf = false;

    this.errorArchivos = '';

    this.limpiarPdf();

    this.cargarTipoDocumento();

    this.cargarTipificacion();

    this.cargarNombresUbicacion();

    this.cargarNombresInspectoria();

    this.cargarSeguimiento();
  }

  // =========================================
  // CATEGORÍA QRD
  // =========================================

  obtenerCategoriaQrd(): string {
    const tipo = Number(this.expediente?.idTipoExpediente);

    switch (tipo) {
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

  // =========================================
  // TIPO DOCUMENTO
  // =========================================

  cargarTipoDocumento(): void {
    if (!this.expediente) {
      return;
    }

    const idTipoDocumento = Number(this.expediente.idTipoDocumento);

    // Si Registrar ya mandó el nombre
    if (this.expediente.documento) {
      this.nombreTipoDocumento = String(this.expediente.documento);
    }

    this.expedienteService.getTiposDocumento().subscribe({
      next: (data: any[]) => {
        const encontrado = (data || []).find(
          (tipo: any) => Number(tipo.idTipoDocumento) === idTipoDocumento,
        );

        if (encontrado) {
          const nombre = String(encontrado.nombre || '').trim();

          // OTROS
          if (
            nombre.toUpperCase() === 'OTROS' &&
            this.expediente.otroTipoDocumento
          ) {
            this.nombreTipoDocumento = this.expediente.otroTipoDocumento;
          } else {
            this.nombreTipoDocumento = nombre;
          }
        }

        if (!this.nombreTipoDocumento) {
          this.nombreTipoDocumento = String(idTipoDocumento || '-');
        }
      },

      error: (err) => {
        console.error('ERROR AL CARGAR TIPO DOCUMENTO:', err);

        this.nombreTipoDocumento =
          this.expediente?.otroTipoDocumento ||
          this.expediente?.documento ||
          String(idTipoDocumento || '-');
      },
    });
  }

  // =========================================
  // TIPIFICACIÓN
  // =========================================

  cargarTipificacion(): void {
    if (!this.expediente) {
      return;
    }

    const idTipoExpediente = Number(this.expediente.idTipoExpediente);

    const idTipificacion = Number(this.expediente.idTipificacion);

    if (!idTipoExpediente || !idTipificacion) {
      this.nombreTipificacion = '-';

      return;
    }

    this.expedienteService.getTipificaciones(idTipoExpediente).subscribe({
      next: (data: any[]) => {
        const encontrado = (data || []).find(
          (item: any) => Number(item.idTipificacion) === idTipificacion,
        );

        this.nombreTipificacion = encontrado?.nombre || String(idTipificacion);
      },

      error: (err) => {
        console.error('ERROR AL CARGAR TIPIFICACIÓN:', err);

        this.nombreTipificacion = String(idTipificacion);
      },
    });
  }

  // =========================================
  // UBICACIÓN NORMAL
  // =========================================

  cargarNombresUbicacion(): void {
    if (!this.expediente) {
      return;
    }

    const idNucleo = this.expediente.idNucleo;

    const idBrigada = this.expediente.idBrigada;

    const idUnidad = this.expediente.idUnidad;

    // =======================================
    // NÚCLEO
    // =======================================

    if (idNucleo) {
      this.usersService.getNucleos().subscribe({
        next: (data: Nucleo[]) => {
          const nucleo = (data || []).find(
            (item: Nucleo) => String(item.idNucleo) === String(idNucleo),
          );

          this.nombreNucleo = nucleo?.nombre || String(idNucleo);
        },

        error: (err) => {
          console.error('ERROR NÚCLEO:', err);

          this.nombreNucleo = String(idNucleo);
        },
      });
    }

    // =======================================
    // GRAN UNIDAD
    // =======================================

    if (idNucleo && idBrigada) {
      this.usersService.getBrigadas(String(idNucleo)).subscribe({
        next: (data: Brigada[]) => {
          const brigada = (data || []).find(
            (item: Brigada) => String(item.idBrigada) === String(idBrigada),
          );

          this.nombreBrigada = brigada?.nombre || String(idBrigada);
        },

        error: (err) => {
          console.error('ERROR GRAN UNIDAD:', err);

          this.nombreBrigada = String(idBrigada);
        },
      });
    }

    // =======================================
    // UNIDAD
    // =======================================

    if (idNucleo && idBrigada && idUnidad) {
      this.usersService
        .getUnidades(String(idNucleo), String(idBrigada))
        .subscribe({
          next: (data: Unidad[]) => {
            const unidad = (data || []).find(
              (item: Unidad) => String(item.idUnidad) === String(idUnidad),
            );

            this.nombreUnidad = unidad?.nombre || String(idUnidad);

            this.guarnicionUnidad = String(unidad?.guarnicion || '').trim();

            this.actualizarNombreNucleoIg();
          },

          error: (err) => {
            console.error('ERROR UNIDAD:', err);

            this.nombreUnidad = String(idUnidad);
          },
        });
    }
  }

  // =========================================
  // UBICACIÓN INSPECTORÍA
  // =========================================

  cargarNombresInspectoria(): void {
    if (!this.expediente) {
      return;
    }

    const idNucleoIg = this.expediente.idNucleoIg;

    const idIg = this.expediente.idIg;

    // =======================================
    // NÚCLEO IG
    // =======================================

    if (idNucleoIg) {
      this.usersService.getNucleos().subscribe({
        next: (data: Nucleo[]) => {
          const nucleo = (data || []).find(
            (item: Nucleo) => String(item.idNucleo) === String(idNucleoIg),
          );

          this.nombreNucleoIg = nucleo?.nombre || String(idNucleoIg);

          this.actualizarNombreNucleoIg();
        },

        error: (err) => {
          console.error('ERROR NÚCLEO IG:', err);

          this.nombreNucleoIg = String(idNucleoIg);
        },
      });
    }

    // =======================================
    // IG
    // ID_IG = BRIGADA
    // =======================================

    if (idNucleoIg && idIg) {
      this.usersService.getBrigadas(String(idNucleoIg)).subscribe({
        next: (data: Brigada[]) => {
          const ig = (data || []).find(
            (item: Brigada) => String(item.idBrigada) === String(idIg),
          );

          this.nombreIg = ig?.nombre || String(idIg);
        },

        error: (err) => {
          console.error('ERROR IG:', err);

          this.nombreIg = String(idIg);
        },
      });
    }
  }

  // =========================================
  // NÚCLEO IG VISUAL
  //
  // V DIVISION DE EJERCITO - IQUITOS
  // =========================================

  actualizarNombreNucleoIg(): void {
    if (!this.nombreNucleoIg) {
      return;
    }

    // Evita duplicar guarnición
    const base = this.nombreNucleoIg.split(' - ')[0].trim();

    if (this.guarnicionUnidad) {
      this.nombreNucleoIg = `${base} - ${this.guarnicionUnidad}`;
    } else {
      this.nombreNucleoIg = base;
    }
  }

  // =========================================
  // DESTINO
  // =========================================

  obtenerDestino(): string {
    const destino = Number(this.expediente?.nivelDestino);

    if (destino === 3) {
      return 'Inspectoría QRD - Nivel 3';
    }

    if (destino === 4) {
      return 'Inspectoría QRD - Nivel 4';
    }

    return '-';
  }

  // =========================================
  // FECHA
  // =========================================

  obtenerFechaDocumento(): string {
    const fecha = this.expediente?.fechaDocumento;

    if (!fecha) {
      return '-';
    }

    // yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}/.test(String(fecha))) {
      const partes = String(fecha).substring(0, 10).split('-');

      return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

    return String(fecha);
  }

  // =========================================
  // OBSERVACIÓN - AUTOGUARDADO
  // =========================================

  cambioObservacion(): void {
    if (this.soloLectura) {
      return;
    }

    this.observacionGuardada = false;
    this.errorObservacion = '';

    if (this.temporizadorObservacion) {
      clearTimeout(this.temporizadorObservacion);
    }

    this.temporizadorObservacion = setTimeout(
      () => this.guardarObservacion(),
      900,
    );
  }

  guardarObservacion(): void {
    if (this.soloLectura) {
      return;
    }

    if (!this.expediente?.idExpediente) {
      return;
    }

    this.guardandoObservacion = true;
    this.observacionGuardada = false;
    this.errorObservacion = '';

    const observacion = String(this.observacionActual || '');

    this.expedienteService
      .actualizarObservacion(this.expediente.idExpediente, observacion)
      .subscribe({
        next: (respuesta: any) => {
          this.guardandoObservacion = false;
          this.observacionGuardada = true;

          this.expediente.observacionActual =
            respuesta?.observacionActual ?? observacion;

          setTimeout(() => {
            this.observacionGuardada = false;
          }, 2200);
        },

        error: (err) => {
          console.error('ERROR GUARDANDO OBSERVACIÓN QRD4:', err);

          this.guardandoObservacion = false;
          this.observacionGuardada = false;
          this.errorObservacion = 'No se pudo guardar la observación.';
        },
      });
  }

  // =========================================
  // DESTINO FINAL - GESTIÓN QRD4
  // =========================================

  guardarDestino(): void {
    if (!this.modoGestion || !this.expediente?.idExpediente) {
      return;
    }

    if (
      this.nivelDestinoSeleccionado !== 3 &&
      this.nivelDestinoSeleccionado !== 4
    ) {
      this.errorDestino = 'Seleccione el destino final: Nivel 3 o Nivel 4.';
      return;
    }

    this.guardandoDestino = true;
    this.destinoGuardado = false;
    this.errorDestino = '';

    this.expedienteService
      .actualizarDestino(
        this.expediente.idExpediente,
        this.nivelDestinoSeleccionado,
      )
      .subscribe({
        next: (respuesta: any) => {
          this.guardandoDestino = false;
          this.destinoGuardado = true;
          this.expediente.nivelDestino =
            respuesta?.nivelDestino ?? this.nivelDestinoSeleccionado;
        },

        error: (err: any) => {
          console.error('ERROR AL GUARDAR DESTINO QRD4:', err);

          this.guardandoDestino = false;
          this.errorDestino =
            err?.error?.message ||
            err?.error?.mensaje ||
            'No se pudo guardar el destino.';
        },
      });
  }

  cambioDestino(): void {
    this.destinoGuardado = false;
    this.errorDestino = '';

    if (
      this.nivelDestinoSeleccionado === 3 ||
      this.nivelDestinoSeleccionado === 4
    ) {
      this.guardarDestino();
    }
  }

  // =========================================
  // SEGUIMIENTO - QRD4
  // =========================================

  cargarSeguimiento(): void {
    const idExpediente = Number(this.expediente?.idExpediente);

    if (!idExpediente) {
      return;
    }

    this.cargandoSeguimiento = true;
    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    this.expedienteService.obtenerSeguimiento(idExpediente).subscribe({
      next: (respuesta: any) => {
        this.cargandoSeguimiento = false;

        const seguimiento = respuesta?.seguimiento ?? respuesta;

        if (
          !seguimiento ||
          (!seguimiento?.fechaInicio && !seguimiento?.fechaFin)
        ) {
          this.limpiarSeguimiento();
          return;
        }

        this.aplicarSeguimiento(seguimiento);
      },

      error: (err: any) => {
        this.cargandoSeguimiento = false;

        if (err?.status === 404 || err?.status === 204) {
          this.limpiarSeguimiento();
          return;
        }

        console.error('ERROR AL CARGAR SEGUIMIENTO QRD4:', err);

        this.errorSeguimiento =
          'No se pudo cargar el seguimiento del expediente.';
      },
    });
  }

  activarSeguimiento(): void {
    if (this.cargandoSeguimiento || this.guardandoSeguimiento) {
      return;
    }

    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    this.seguimientoActivo = true;

    if (!this.seguimientoGuardado) {
      this.fechaInicioSeguimiento = '';
      this.fechaFinSeguimiento = '';
      this.cantidadDiasSeguimiento = 0;
    }
  }

  editarSeguimiento(): void {
    if (!this.seguimientoGuardado || this.guardandoSeguimiento) {
      return;
    }

    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    this.fechaInicioSeguimientoGuardada = this.fechaInicioSeguimiento;

    this.fechaFinSeguimientoGuardada = this.fechaFinSeguimiento;

    this.cantidadDiasSeguimientoGuardada = this.cantidadDiasSeguimiento;

    this.seguimientoActivo = true;
  }

  cancelarSeguimiento(): void {
    if (this.guardandoSeguimiento) {
      return;
    }

    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    if (this.seguimientoGuardado) {
      this.fechaInicioSeguimiento = this.fechaInicioSeguimientoGuardada;

      this.fechaFinSeguimiento = this.fechaFinSeguimientoGuardada;

      this.cantidadDiasSeguimiento = this.cantidadDiasSeguimientoGuardada;

      this.seguimientoActivo = false;

      return;
    }

    this.seguimientoActivo = false;
    this.fechaInicioSeguimiento = '';
    this.fechaFinSeguimiento = '';
    this.cantidadDiasSeguimiento = 0;
  }

  calcularDiasSeguimiento(): void {
    if (!this.fechaInicioSeguimiento || !this.fechaFinSeguimiento) {
      this.cantidadDiasSeguimiento = 0;
      return;
    }

    const inicio = new Date(this.fechaInicioSeguimiento + 'T00:00:00');

    const fin = new Date(this.fechaFinSeguimiento + 'T00:00:00');

    const diferencia = fin.getTime() - inicio.getTime();

    if (diferencia < 0) {
      this.cantidadDiasSeguimiento = 0;
      return;
    }

    this.cantidadDiasSeguimiento = Math.floor(
      diferencia / (1000 * 60 * 60 * 24),
    );
  }

  guardarSeguimiento(): void {
    const idExpediente = Number(this.expediente?.idExpediente);

    this.errorSeguimiento = '';
    this.mensajeSeguimiento = '';

    if (!idExpediente) {
      this.errorSeguimiento = 'No se encontró el ID del expediente.';
      return;
    }

    if (!this.fechaInicioSeguimiento || !this.fechaFinSeguimiento) {
      this.errorSeguimiento =
        'Seleccione la fecha de inicio y la fecha de fin.';
      return;
    }

    this.calcularDiasSeguimiento();

    if (this.fechaFinSeguimiento < this.fechaInicioSeguimiento) {
      this.errorSeguimiento =
        'La fecha de fin no puede ser anterior a la fecha de inicio.';
      return;
    }

    this.guardandoSeguimiento = true;

    const peticion = this.seguimientoGuardado
      ? this.expedienteService.actualizarSeguimiento(
          idExpediente,
          this.fechaInicioSeguimiento,
          this.fechaFinSeguimiento,
        )
      : this.expedienteService.guardarSeguimiento(
          idExpediente,
          this.fechaInicioSeguimiento,
          this.fechaFinSeguimiento,
        );

    const esEdicion = this.seguimientoGuardado;

    peticion.subscribe({
      next: (respuesta: any) => {
        this.guardandoSeguimiento = false;

        const seguimiento = respuesta?.seguimiento ?? respuesta ?? {};

        this.aplicarSeguimiento({
          ...seguimiento,
          fechaInicio: seguimiento?.fechaInicio ?? this.fechaInicioSeguimiento,
          fechaFin: seguimiento?.fechaFin ?? this.fechaFinSeguimiento,
          cantidadDias:
            seguimiento?.cantidadDias ?? this.cantidadDiasSeguimiento,
        });

        this.mensajeSeguimiento = esEdicion
          ? 'Seguimiento actualizado correctamente.'
          : 'Seguimiento guardado correctamente.';

        setTimeout(() => {
          this.mensajeSeguimiento = '';
        }, 2500);
      },

      error: (err: any) => {
        console.error('ERROR AL GUARDAR SEGUIMIENTO QRD4:', err);

        this.guardandoSeguimiento = false;
        this.errorSeguimiento =
          err?.error?.message ||
          err?.error?.mensaje ||
          'No se pudo guardar el seguimiento.';
      },
    });
  }

  private aplicarSeguimiento(seguimiento: any): void {
    this.fechaInicioSeguimiento = this.normalizarFecha(
      seguimiento?.fechaInicio,
    );

    this.fechaFinSeguimiento = this.normalizarFecha(seguimiento?.fechaFin);

    const cantidadBackend = Number(seguimiento?.cantidadDias);

    if (Number.isFinite(cantidadBackend)) {
      this.cantidadDiasSeguimiento = cantidadBackend;
    } else {
      this.calcularDiasSeguimiento();
    }

    this.fechaInicioSeguimientoGuardada = this.fechaInicioSeguimiento;

    this.fechaFinSeguimientoGuardada = this.fechaFinSeguimiento;

    this.cantidadDiasSeguimientoGuardada = this.cantidadDiasSeguimiento;

    this.seguimientoGuardado = true;
    this.seguimientoActivo = false;
  }

  private limpiarSeguimiento(): void {
    this.seguimientoActivo = false;
    this.seguimientoGuardado = false;
    this.fechaInicioSeguimiento = '';
    this.fechaFinSeguimiento = '';
    this.cantidadDiasSeguimiento = 0;
    this.fechaInicioSeguimientoGuardada = '';
    this.fechaFinSeguimientoGuardada = '';
    this.cantidadDiasSeguimientoGuardada = 0;
  }

  private normalizarFecha(fecha: any): string {
    if (!fecha) {
      return '';
    }

    return String(fecha).substring(0, 10);
  }
  // =========================================
  // CAMBIAR PESTAÑA
  // =========================================

  cambiarPestana(numero: number): void {
    this.pestanaActiva = numero;

    if (numero === 2 && !this.archivosCargados) {
      this.cargarArchivos();
    }
  }

  // =========================================
  // CARGAR PDFs
  // =========================================

  cargarArchivos(): void {
    if (!this.expediente || !this.expediente.idExpediente) {
      this.errorArchivos = 'No se encontró el ID del expediente.';

      return;
    }

    this.cargandoArchivos = true;

    this.errorArchivos = '';

    this.archivos = [];

    this.archivoSeleccionado = null;

    this.limpiarPdf();

    this.expedienteService
      .listarArchivosExpediente(this.expediente.idExpediente)
      .subscribe({
        next: (respuesta: any[]) => {
          this.archivos = respuesta || [];

          this.archivosCargados = true;

          this.cargandoArchivos = false;

          if (this.archivos.length > 0) {
            this.seleccionarArchivo(this.archivos[0]);
          }
        },

        error: (error) => {
          console.error('ERROR AL CARGAR ARCHIVOS QRD:', error);

          this.cargandoArchivos = false;

          this.archivosCargados = false;

          this.errorArchivos = 'No se pudieron cargar los documentos adjuntos.';
        },
      });
  }

  // =========================================
  // SELECCIONAR PDF
  // =========================================

  seleccionarArchivo(archivo: any): void {
    if (!archivo || !archivo.idArchivo) {
      return;
    }

    this.archivoSeleccionado = archivo;

    this.limpiarPdf();

    this.cargandoPdf = true;

    this.errorArchivos = '';

    this.expedienteService.verArchivo(archivo.idArchivo).subscribe({
      next: (blob: Blob) => {
        const pdfBlob = new Blob([blob], {
          type: 'application/pdf',
        });

        this.objectUrlActual = URL.createObjectURL(pdfBlob);

        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.objectUrlActual,
        );

        this.cargandoPdf = false;
      },

      error: (error) => {
        console.error('ERROR AL ABRIR PDF QRD:', error);

        this.cargandoPdf = false;

        this.pdfUrl = null;

        this.errorArchivos = 'No se pudo visualizar el documento PDF.';
      },
    });
  }

  // =========================================
  // ENVIAR A N3
  // =========================================

  solicitarEnvioNivel3(): void {
    if (this.soloLectura) {
      return;
    }

    if (!this.expediente) {
      return;
    }

    if (this.modoGestion && !this.destinoGuardado) {
      this.errorDestino = 'Guarde el destino final antes de enviar.';
      return;
    }

    if (this.modoGestion && !this.seguimientoGuardado) {
      this.errorSeguimiento =
        'Registre y guarde el seguimiento antes de enviar.';
      return;
    }

    this.darRespuesta.emit(this.expediente);
  }

  // =========================================
  // ACCIONES DE PENDIENTES QRD4
  // =========================================

  puedeDarRespuesta(): boolean {
    return (
      Number(this.expediente?.nivelDestino) === 4 && this.seguimientoGuardado
    );
  }

  solicitarRespuesta(): void {
    if (this.soloLectura || !this.puedeDarRespuesta()) {
      this.errorSeguimiento =
        'QRD Nivel 2 debe registrar el destino y seguimiento antes de responder.';
      return;
    }

    this.respuestaIniciada = true;
    this.darRespuesta.emit(this.expediente);
  }

  enviarRespuestaANivel3(): void {
    if (!this.expediente?.idExpediente) {
      return;
    }

    Swal.fire({
      icon: 'question',
      title: '¿Enviar respuesta a QRD Nivel 3?',
      text: 'QRD Nivel 3 revisará la respuesta antes de enviarla a QRD Nivel 2.',
      showCancelButton: true,
      confirmButtonText: 'SÍ, ENVIAR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#176b49',
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.expedienteService
        .enviarRespuestaANivel3(Number(this.expediente.idExpediente))
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Respuesta enviada',
              text: 'El expediente fue enviado a QRD Nivel 3.',
              confirmButtonColor: '#176b49',
            }).then(() => {
              this.cerrarModal();
            });
          },

          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo enviar',
              text:
                error?.error?.message ||
                error?.error ||
                'Primero debe registrar al menos un informe de respuesta.',
            });
          },
        });
    });
  }

  solicitarDevolucion(): void {
    const observacion = String(this.observacionActual || '').trim();

    if (!observacion) {
      this.errorObservacion =
        'Debe registrar la observación antes de devolver el documento.';
      return;
    }

    if (!this.expediente?.idExpediente) {
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Devolver documento a QRD Nivel 3?',
      text: 'El caso quedará observado para que QRD Nivel 3 lo corrija.',
      showCancelButton: true,
      confirmButtonText: 'SÍ, DEVOLVER',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#b42318',
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.expedienteService
        .devolverDocumentoANivel3(
          Number(this.expediente.idExpediente),
          observacion,
        )
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Documento devuelto',
              text: 'El expediente fue enviado como observado a QRD Nivel 3.',
              confirmButtonColor: '#b42318',
            }).then(() => {
              this.cerrarModal();
            });
          },

          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo devolver',
              text:
                error?.error?.message ||
                error?.error ||
                'Ocurrió un error al devolver el documento.',
            });
          },
        });
    });
  }

  // =========================================
  // LIMPIAR PDF
  // =========================================

  private limpiarPdf(): void {
    if (this.objectUrlActual) {
      URL.revokeObjectURL(this.objectUrlActual);

      this.objectUrlActual = null;
    }

    this.pdfUrl = null;
  }

  // =========================================
  // CERRAR
  // =========================================

  cerrarModal(): void {
    this.limpiarPdf();

    this.archivos = [];

    this.archivoSeleccionado = null;

    this.archivosCargados = false;

    this.cargandoArchivos = false;

    this.cargandoPdf = false;

    this.errorArchivos = '';

    if (this.temporizadorObservacion) {
      clearTimeout(this.temporizadorObservacion);
    }

    this.pestanaActiva = 1;

    this.cerrar.emit();
  }
}
