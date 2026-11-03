import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { IntegridadService } from '../../../../services/integridad.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad,
} from '../../../../services/users.service';

@Component({
  selector: 'app-nuevo-registro-integridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-registro-integridad.component.html',
  styleUrl: './nuevo-registro-integridad.component.css',
})
export class NuevoRegistroIntegridadComponent implements OnInit, OnDestroy {
  @Output()
  guardado = new EventEmitter<any>();

  // DATOS PERSONALES

  mostrarDatosPersona = false;

  identificacion: string | null = null;
  sexo: string | null = null;

  nombres = '';
  apellidos = '';
  ruc = '';
  dni = '';
  telefono = '';
  domicilio = '';
  correo = '';

  // DOCUMENTO

  tipoDocumento: string | null = null;

  codigo = '';
  fechaRegistro = '';

  // DENUNCIA

  fechaActoCorrupcion = '';
  motivoDenuncia: string | null = null;
  medidaProteccion: string | null = null;

  detalle = '';
  detalleOtros = '';

  // UBICACIÓN

  nucleos: Nucleo[] = [];
  brigadas: Brigada[] = [];
  unidades: Unidad[] = [];

  idNucleo: string | null = null;
  idBrigada: string | null = null;
  idUnidad: string | null = null;

  // INSPECTORÍA

  nucleosIg: Nucleo[] = [];
  brigadasIg: Brigada[] = [];

  idNucleoIg: number | null = null;
  idIg: string | null = null;

  nivelDestino: number | null = null;

  // ARCHIVOS

  archivos: File[] = [];

  readonly maxArchivos = 5;
  readonly maxTamanoPdf = 10 * 1024 * 1024;

  // CONTROL

  guardando = false;
  intentoGuardar = false;

  cargandoNucleos = false;
  cargandoBrigadas = false;
  cargandoUnidades = false;
  cargandoIg = false;

  private readonly destroy$ = new Subject<void>();

  // Evita aplicar respuestas de selecciones anteriores.
  private versionBrigadas = 0;
  private versionUnidades = 0;
  private versionIg = 0;

  // Misma regla utilizada actualmente en QRD.
  private readonly brigadasNivel4: Record<string, string[]> = {
    '41': ['0804', '0990', '0809', '0808', '0806', '0810', '0812', '0816'],
    '42': ['0991', '0824', '0828', '0838'],
    '43': [
      '0845',
      '0846',
      '0844',
      '0850',
      '0842',
      '0848',
      '0993',
      '0992',
      '0878',
    ],
    '44': ['0880', '0882', '1001', '0875'],
    '45': ['0865', '0864'],
    '21': ['0734'],
  };

  constructor(
    private integridadService: IntegridadService,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.cargarNucleos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // VALIDACIÓN DE LA PERSONA

  get esIdentificado(): boolean {
    return this.identificacion === 'DENUNCIANTE';
  }

  get errorContacto(): string {
    const nombres = this.nombres.trim();
    const apellidos = this.apellidos.trim();
    const dni = this.dni.trim();
    const ruc = this.ruc.trim();
    const telefono = this.telefono.trim();
    const domicilio = this.domicilio.trim();
    const correo = this.correo.trim();

    if (this.esIdentificado) {
      if (!nombres) {
        return 'Ingrese los nombres del denunciante.';
      }

      if (!apellidos) {
        return 'Ingrese los apellidos del denunciante.';
      }

      if (!this.sexo) {
        return 'Seleccione el sexo del denunciante.';
      }

      if (!dni) {
        return 'Ingrese el DNI del denunciante.';
      }

      if (!telefono) {
        return 'Ingrese el teléfono del denunciante.';
      }

      if (!domicilio) {
        return 'Ingrese el domicilio del denunciante.';
      }

      if (!correo) {
        return 'Ingrese el correo electrónico del denunciante.';
      }
    }

    if (dni && !/^\d{8}$/.test(dni)) {
      return 'El DNI debe contener exactamente 8 dígitos.';
    }

    if (ruc && !/^\d{11}$/.test(ruc)) {
      return 'El RUC debe contener exactamente 11 dígitos.';
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return 'Ingrese un correo electrónico válido.';
    }

    if (
      nombres.length > 100 ||
      apellidos.length > 150 ||
      telefono.length > 30 ||
      domicilio.length > 250 ||
      correo.length > 150
    ) {
      return 'Revise la longitud de los datos personales.';
    }

    return '';
  }

  get asignacionInvalida(): boolean {
    return (
      !this.idNucleo ||
      !this.idBrigada ||
      !this.idUnidad ||
      this.idNucleoIg === null ||
      !this.idIg
    );
  }

  // CARGAR NÚCLEOS

  cargarNucleos(): void {
    this.cargandoNucleos = true;

    this.usersService
      .getNucleos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Nucleo[]) => {
          this.nucleos = data || [];
          this.nucleosIg = [...this.nucleos];

          this.cargandoNucleos = false;
        },
        error: () => {
          this.nucleos = [];
          this.nucleosIg = [];

          this.cargandoNucleos = false;

          this.mostrarError('No se pudieron cargar los núcleos.');
        },
      });
  }

  // NÚCLEO → GRAN UNIDAD

  cambiarNucleo(): void {
    const version = ++this.versionBrigadas;

    ++this.versionUnidades;
    ++this.versionIg;

    this.idBrigada = null;
    this.idUnidad = null;

    this.brigadas = [];
    this.unidades = [];

    this.limpiarInspectoria();

    this.nivelDestino = null;

    this.cargandoBrigadas = false;
    this.cargandoUnidades = false;
    this.cargandoIg = false;

    if (!this.idNucleo) {
      return;
    }

    this.cargandoBrigadas = true;

    this.usersService
      .getBrigadas(String(this.idNucleo))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Brigada[]) => {
          if (version !== this.versionBrigadas) {
            return;
          }

          this.brigadas = data || [];
          this.cargandoBrigadas = false;
        },
        error: () => {
          if (version !== this.versionBrigadas) {
            return;
          }

          this.brigadas = [];
          this.cargandoBrigadas = false;

          this.mostrarError('No se pudieron cargar las grandes unidades.');
        },
      });
  }

  // GRAN UNIDAD → UNIDADES

  cambiarBrigada(): void {
    const version = ++this.versionUnidades;

    ++this.versionIg;

    this.idUnidad = null;
    this.unidades = [];

    this.limpiarInspectoria();

    this.cargandoUnidades = false;
    this.cargandoIg = false;

    this.actualizarDestinoAutomatico();

    if (!this.idNucleo || !this.idBrigada) {
      return;
    }

    this.cargandoUnidades = true;

    this.usersService
      .getUnidades(String(this.idNucleo), String(this.idBrigada))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Unidad[]) => {
          if (version !== this.versionUnidades) {
            return;
          }

          this.unidades = data || [];
          this.cargandoUnidades = false;
        },
        error: () => {
          if (version !== this.versionUnidades) {
            return;
          }

          this.unidades = [];
          this.cargandoUnidades = false;

          this.mostrarError('No se pudieron cargar las unidades.');
        },
      });
  }

  // UNIDAD → NÚCLEO IG E IG

  cambiarUnidad(): void {
    const version = ++this.versionIg;

    this.limpiarInspectoria();

    this.cargandoIg = false;

    this.actualizarDestinoAutomatico();

    const unidad = this.obtenerUnidadSeleccionada();

    if (!unidad) {
      return;
    }

    const nucleoIg = Number(unidad.idNucleo);

    if (!Number.isFinite(nucleoIg)) {
      this.mostrarError('La unidad seleccionada no tiene un núcleo válido.');
      return;
    }

    this.idNucleoIg = nucleoIg;

    const idIgAutomatico = String(unidad.idBrigada ?? '').trim();

    this.cargandoIg = true;

    this.usersService
      .getBrigadas(String(unidad.idNucleo))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Brigada[]) => {
          if (version !== this.versionIg) {
            return;
          }

          this.brigadasIg = data || [];

          const igExiste = this.brigadasIg.some(
            (brigada) => String(brigada.idBrigada).trim() === idIgAutomatico,
          );

          this.idIg = igExiste ? idIgAutomatico : null;

          this.cargandoIg = false;
        },
        error: () => {
          if (version !== this.versionIg) {
            return;
          }

          this.brigadasIg = [];
          this.idIg = null;

          this.cargandoIg = false;

          this.mostrarError('No se pudieron cargar las inspectorías.');
        },
      });
  }

  private limpiarInspectoria(): void {
    this.idNucleoIg = null;
    this.idIg = null;
    this.brigadasIg = [];
  }

  obtenerUnidadSeleccionada(): Unidad | undefined {
    return this.unidades.find(
      (unidad) => String(unidad.idUnidad) === String(this.idUnidad),
    );
  }

  obtenerNombreNucleoIg(nucleo: Nucleo): string {
    const nombre = String(nucleo?.nombre || '').trim();

    const unidad = this.obtenerUnidadSeleccionada();

    if (
      unidad &&
      String(unidad.idNucleo) === String(nucleo.idNucleo) &&
      unidad.guarnicion
    ) {
      return nombre + ' - ' + String(unidad.guarnicion).trim();
    }

    return nombre;
  }

  obtenerNombreIg(): string {
    const ig = this.brigadasIg.find(
      (brigada) => String(brigada.idBrigada) === String(this.idIg),
    );

    return ig?.nombre || '';
  }

  // DESTINO AUTOMÁTICO, EDITABLE DESDE EL SELECT

  private actualizarDestinoAutomatico(): void {
    const nucleo = String(this.idNucleo ?? '').trim();

    const brigada = String(this.idBrigada ?? '').trim();

    const unidad = String(this.idUnidad ?? '').trim();

    if (!nucleo || !brigada) {
      this.nivelDestino = null;
      return;
    }

    const correspondeNivel4 =
      this.brigadasNivel4[nucleo]?.includes(brigada) ?? false;

    // HMC pertenece a COSALE, pero se distingue
    // por el ID de unidad.
    const esHospitalMilitarCentral =
      nucleo === '32' &&
      brigada === '0798' &&
      ['M10200', 'M10201'].includes(unidad);

    this.nivelDestino = correspondeNivel4 || esHospitalMilitarCentral ? 4 : 3;
  }

  // ARCHIVOS PDF

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;

    const seleccionados = Array.from(input.files || []);

    input.value = '';

    if (this.guardando || !seleccionados.length) {
      return;
    }

    const nuevos: File[] = [];

    for (const archivo of seleccionados) {
      const nombre = archivo.name.toLowerCase();

      const extensionValida =
        nombre.endsWith('.pdf') || nombre.endsWith('.zip');

      if (!extensionValida) {
        this.mostrarAdvertencia(
          `El archivo "${archivo.name}" no está permitido. Solo puede adjuntar PDF o ZIP.`,
        );
        return;
      }

      if (archivo.size === 0) {
        this.mostrarAdvertencia(`El archivo "${archivo.name}" está vacío.`);
        return;
      }

      if (archivo.size > this.maxTamanoPdf) {
        this.mostrarAdvertencia(
          `El archivo "${archivo.name}" supera los 10 MB.`,
        );
        return;
      }

      const repetido = [...this.archivos, ...nuevos].some(
        (existente) =>
          existente.name === archivo.name &&
          existente.size === archivo.size &&
          existente.lastModified === archivo.lastModified,
      );

      if (!repetido) {
        nuevos.push(archivo);
      }
    }

    if (this.archivos.length + nuevos.length > this.maxArchivos) {
      this.mostrarAdvertencia(
        `Solo se permiten ${this.maxArchivos} archivos en total, entre PDF y ZIP.`,
      );
      return;
    }

    this.archivos = [...this.archivos, ...nuevos];
  }

  eliminarArchivo(index: number): void {
    if (this.guardando) {
      return;
    }

    this.archivos = this.archivos.filter((_, posicion) => posicion !== index);
  }

  obtenerTamanoArchivo(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  obtenerTipoArchivo(archivo: File): string {
    return archivo.name.toLowerCase().endsWith('.zip') ? 'ZIP' : 'PDF';
  }

  cambiarIdentificacion(): void {
    this.mostrarDatosPersona = true;
  }

  // VALIDACIÓN GENERAL

  private validarFormulario(): boolean {
    this.intentoGuardar = true;

    if (
      this.cargandoNucleos ||
      this.cargandoBrigadas ||
      this.cargandoUnidades ||
      this.cargandoIg
    ) {
      this.mostrarAdvertencia(
        'Espere a que terminen de cargar los desplegables.',
      );
      return false;
    }

    if (
      this.identificacion !== 'DENUNCIANTE' &&
      this.identificacion !== 'ANONIMA'
    ) {
      this.mostrarAdvertencia('Seleccione la identificación del denunciante.');
      return false;
    }

    const errorPersona = this.errorContacto;

    if (errorPersona) {
      this.mostrarDatosPersona = true;
      this.mostrarAdvertencia(errorPersona);
      return false;
    }
    if (!this.fechaRegistro) {
      this.mostrarAdvertencia('Seleccione la fecha de registro.');
      return false;
    }

    if (!this.fechaActoCorrupcion) {
      this.mostrarAdvertencia('Ingrese la fecha del acto de corrupción.');
      return false;
    }

    if (!this.motivoDenuncia) {
      this.mostrarAdvertencia('Seleccione el motivo de la denuncia.');
      return false;
    }

    if (
      this.codigo.trim().length > 100 ||
      this.detalle.trim().length > 3000 ||
      this.detalleOtros.trim().length > 3000
    ) {
      this.mostrarAdvertencia(
        'Revise la longitud del código y los detalles de la denuncia.',
      );
      return false;
    }

    if (this.asignacionInvalida) {
      this.mostrarAdvertencia('Complete Núcleo, Gran Unidad, Unidad e IG.');
      return false;
    }

    const unidad = this.obtenerUnidadSeleccionada();

    if (
      !unidad ||
      String(unidad.idNucleo) !== String(this.idNucleo) ||
      String(unidad.idBrigada) !== String(this.idBrigada)
    ) {
      this.mostrarAdvertencia(
        'La unidad seleccionada no corresponde al núcleo y gran unidad.',
      );
      return false;
    }

    const igExiste = this.brigadasIg.some(
      (brigada) => String(brigada.idBrigada) === String(this.idIg),
    );

    if (!igExiste) {
      this.mostrarAdvertencia('Seleccione una IG válida.');
      return false;
    }

    if (this.nivelDestino !== 3 && this.nivelDestino !== 4) {
      this.mostrarAdvertencia(
        'Seleccione un destino: Integridad Nivel 3 o Nivel 4.',
      );
      return false;
    }

    return true;
  }

  // GUARDAR

  guardar(): void {
    if (this.guardando) {
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    const expediente = {
      categoria: 'INTEGRIDAD',
      fechaRegistro: `${this.fechaRegistro}T00:00:00`,
      nroDocumento: this.codigo.trim() || null,
      descripcion: this.detalle.trim() || null,

      idNucleo: this.idNucleo,
      idBrigada: this.idBrigada,
      idUnidad: this.idUnidad,

      idNucleoIg: this.idNucleoIg,
      idIg: this.idIg,

      // Destino final. Registrar no deriva el caso.
      nivelDestino: this.nivelDestino,
    };

    const datosIntegridad = {
      tipoDocumento: this.tipoDocumento,

      identificacion: this.identificacion,
      sexo: this.sexo || null,

      nombres: this.nombres.trim() || null,
      apellidos: this.apellidos.trim() || null,
      ruc: this.ruc.trim() || null,
      dni: this.dni.trim() || null,
      telefono: this.telefono.trim() || null,
      domicilio: this.domicilio.trim() || null,
      correo: this.correo.trim() || null,

      fechaActoCorrupcion: this.fechaActoCorrupcion,
      motivoDenuncia: this.motivoDenuncia,
      medidaProteccion: this.medidaProteccion,

      detalle: this.detalle.trim(),
      detalleOtros: this.detalleOtros.trim(),
    };

    this.guardando = true;

    this.integridadService
      .guardarDenuncia(expediente, datosIntegridad, [...this.archivos])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta: any) => {
          this.guardando = false;

          this.limpiarFormulario();

          // El componente padre muestra el éxito
          // y actualiza la lista.
          this.guardado.emit(respuesta);
        },

        error: (error: any) => {
          this.guardando = false;

          const cuerpo = error?.error;

          const mensaje =
            typeof cuerpo?.message === 'string'
              ? cuerpo.message
              : typeof cuerpo?.mensaje === 'string'
                ? cuerpo.mensaje
                : typeof cuerpo === 'string'
                  ? cuerpo
                  : 'No se pudo registrar la denuncia.';

          this.mostrarError(mensaje);
        },
      });
  }

  // LIMPIAR

  limpiarFormulario(): void {
    if (this.guardando) {
      return;
    }

    // Invalida las consultas anteriores.
    ++this.versionBrigadas;
    ++this.versionUnidades;
    ++this.versionIg;

    this.mostrarDatosPersona = true;

    this.identificacion = null;
    this.sexo = null;

    this.nombres = '';
    this.apellidos = '';
    this.ruc = '';
    this.dni = '';
    this.telefono = '';
    this.domicilio = '';
    this.correo = '';

    this.tipoDocumento = null;
    this.codigo = '';
    this.fechaRegistro = '';

    this.fechaActoCorrupcion = '';
    this.motivoDenuncia = null;
    this.medidaProteccion = null;

    this.detalle = '';
    this.detalleOtros = '';

    this.idNucleo = null;
    this.idBrigada = null;
    this.idUnidad = null;

    this.brigadas = [];
    this.unidades = [];

    this.limpiarInspectoria();

    this.nivelDestino = null;

    this.cargandoBrigadas = false;
    this.cargandoUnidades = false;
    this.cargandoIg = false;

    this.archivos = [];
    this.intentoGuardar = false;
  }

  // MENSAJES

  private mostrarAdvertencia(mensaje: string): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Revise los datos',
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#166b49',
    });
  }

  private mostrarError(mensaje: string): void {
    void Swal.fire({
      icon: 'error',
      title: 'No se pudo completar',
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#166b49',
    });
  }
}
