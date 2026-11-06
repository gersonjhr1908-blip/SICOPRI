import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ExpedienteService } from '../../../../services/expediente.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad,
} from '../../../../services/users.service';

@Component({
  selector: 'app-nuevo-documento-qrd4',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './nuevo-documento-qrd4.component.html',

  styleUrl: './nuevo-documento-qrd4.component.css',
})
export class NuevoDocumentoQrd4Component implements OnInit {
  // =========================================
  // CATÁLOGOS
  // =========================================

  tiposExpediente: any[] = [];

  tiposDocumento: any[] = [];

  tipificaciones: any[] = [];

  // =========================================
  // UBICACIÓN ORIGINAL
  // =========================================

  nucleos: Nucleo[] = [];

  brigadas: Brigada[] = [];

  unidades: Unidad[] = [];

  // =========================================
  // UBICACIÓN IG
  // =========================================

  nucleosIg: Nucleo[] = [];

  brigadasIg: Brigada[] = [];

  // =========================================
  // IDS DOCUMENTO
  // =========================================

  idTipoExpediente: number | null = null;

  idTipoDocumento: number | null = null;

  idTipificacion: number | null = null;

  // =========================================
  // OTRO TIPO DOCUMENTO
  // =========================================

  otroTipoDocumento = '';

  // =========================================
  // UBICACIÓN
  // =========================================

  idNucleo: string | null = null;

  idBrigada: string | null = null;

  idUnidad: string | null = null;

  // =========================================
  // UBICACIÓN IG
  // =========================================

  idNucleoIg: number | null = null;

  idIg: string | null = null;

  // =========================================
  // DATOS DOCUMENTO
  // =========================================

  nroDocumento = '';

  fechaDocumento = '';

  asunto = '';

  descripcion = '';

  // =========================================
  // PDFs
  // =========================================

  archivos: File[] = [];

  // =========================================
  // ESTADOS
  // =========================================

  guardando = false;

  mostrarExito = false;

  cinvGenerado = '';

  // =========================================
  // OUTPUTS
  // =========================================

  @Output()
  documentoRegistrado = new EventEmitter<any>();

  @Output()
  cerrarModal = new EventEmitter<void>();

  mostrarDatosPersona = false;

  datosPersona: Record<string, string> = {
    nombres: '',
    apellidos: '',
    ruc: '',
    dni: '',
    telefono: '',
    domicilio: '',
    correo: '',
    situacion: '',
  };

  readonly camposPersona = [
    {
      clave: 'nombres',
      etiqueta: 'NOMBRES',
      tipo: 'text',
      maximo: 100,
      placeholder: 'Ingrese los nombres',
    },
    {
      clave: 'apellidos',
      etiqueta: 'APELLIDOS',
      tipo: 'text',
      maximo: 150,
      placeholder: 'Ingrese los apellidos',
    },
    {
      clave: 'ruc',
      etiqueta: 'RUC',
      tipo: 'text',
      maximo: 11,
      placeholder: 'Ingrese 11 dígitos',
    },
    {
      clave: 'dni',
      etiqueta: 'DNI',
      tipo: 'text',
      maximo: 8,
      placeholder: 'Ingrese 8 dígitos',
    },
    {
      clave: 'telefono',
      etiqueta: 'TELÉFONO',
      tipo: 'tel',
      maximo: 25,
      placeholder: 'Ingrese el teléfono',
    },
    {
      clave: 'domicilio',
      etiqueta: 'DOMICILIO',
      tipo: 'text',
      maximo: 250,
      placeholder: 'Ingrese la dirección',
    },
    {
      clave: 'correo',
      etiqueta: 'CORREO ELECTRÓNICO',
      tipo: 'email',
      maximo: 254,
      placeholder: 'Ingrese el correo',
    },
  ];

  private cargarDatosPersona(persona: any = null): void {
    this.datosPersona = {
      nombres: persona?.nombres ?? '',
      apellidos: persona?.apellidos ?? '',
      ruc: persona?.ruc ?? '',
      dni: persona?.dni ?? '',
      telefono: persona?.telefono ?? '',
      domicilio: persona?.domicilio ?? '',
      correo: persona?.correo ?? '',
      situacion: persona?.situacion ?? '',
    };

    this.mostrarDatosPersona = Object.values(this.datosPersona).some(
      (valor) => valor.trim() !== '',
    );
  }

  obtenerErrorPersona(clave: string): string {
    const valor = String(this.datosPersona[clave] ?? '').trim();

    if (!valor) {
      return '';
    }

    if (clave === 'ruc' && !/^\d{11}$/.test(valor)) {
      return 'Ingrese un RUC de 11 dígitos.';
    }

    if (clave === 'dni' && !/^\d{8}$/.test(valor)) {
      return 'Ingrese un DNI de 8 dígitos.';
    }

    if (clave === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return 'Ingrese un correo válido.';
    }

    return '';
  }

  private obtenerDatosPersonaParaGuardar() {
    return {
      nombres: this.datosPersona['nombres'].trim(),
      apellidos: this.datosPersona['apellidos'].trim(),
      ruc: this.datosPersona['ruc'].trim(),
      dni: this.datosPersona['dni'].trim(),
      telefono: this.datosPersona['telefono'].trim(),
      domicilio: this.datosPersona['domicilio'].trim(),
      correo: this.datosPersona['correo'].trim(),
      situacion: this.datosPersona['situacion'] || null,
    };
  }

  readonly personaSoloLectura = false;
  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private expedienteService: ExpedienteService,

    private usersService: UsersService,
  ) {}

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {
    this.cargarCatalogos();

    this.cargarNucleos();
  }

  // =========================================
  // CATÁLOGOS
  // =========================================

  cargarCatalogos(): void {
    // =======================================
    // DENUNCIA / QUEJA / RECLAMO
    // INTEGRIDAD = 5, NO MOSTRAR
    // =======================================

    this.expedienteService.getTiposExpediente().subscribe({
      next: (data) => {
        this.tiposExpediente = (data || []).filter(
          (tipo: any) => Number(tipo.idTipoExpediente) !== 5,
        );
      },

      error: (err) => {
        console.error('ERROR TIPOS EXPEDIENTE QR4:', err);
      },
    });

    // =======================================
    // TIPOS DE DOCUMENTO
    // =======================================

    this.expedienteService.getTiposDocumento().subscribe({
      next: (data) => {
        const esOtros = (tipo: { codigo?: string; nombre?: string }): boolean =>
          [tipo.codigo, tipo.nombre].some(
            valor => valor?.trim().toUpperCase() === 'OTROS',
          );

        this.tiposDocumento = [...(data ?? [])].sort(
          (a, b) => Number(esOtros(a)) - Number(esOtros(b)),
        );
      },

      error: (err) => {
        console.error('ERROR TIPOS DOCUMENTO QR4:', err);
      },
    });
  }

  // =========================================
  // CAMBIAR CATEGORÍA
  // =========================================

  cambiarTipoExpediente(): void {
    this.idTipificacion = null;

    this.tipificaciones = [];

    if (!this.idTipoExpediente) {
      return;
    }

    this.expedienteService.getTipificaciones(this.idTipoExpediente).subscribe({
      next: (data) => {
        this.tipificaciones = data || [];
      },

      error: (err) => {
        console.error('ERROR TIPIFICACIONES QR4:', err);
      },
    });
  }

  // =========================================
  // DOCUMENTO = OTROS
  // =========================================

  esTipoDocumentoOtros(): boolean {
    if (!this.idTipoDocumento) {
      return false;
    }

    const tipo = this.tiposDocumento.find(
      (item: any) =>
        Number(item.idTipoDocumento) === Number(this.idTipoDocumento),
    );

    const nombre = String(tipo?.nombre || '')
      .trim()
      .toUpperCase();

    return nombre === 'OTROS' || String(tipo?.codigo ?? '').trim().toUpperCase() === 'OTROS';
  }

  cambiarTipoDocumento(): void {
    if (!this.esTipoDocumentoOtros()) {
      this.otroTipoDocumento = '';
    }
  }

  // =========================================
  // NÚCLEOS
  // =========================================

  cargarNucleos(): void {
    this.usersService.getNucleos().subscribe({
      next: (data) => {
        this.nucleos = data || [];

        this.nucleosIg = data || [];
      },

      error: (err) => {
        console.error('ERROR NÚCLEOS QR4:', err);
      },
    });
  }

  // =========================================
  // CAMBIAR NÚCLEO
  // =========================================

  cambiarNucleo(): void {
    this.idBrigada = null;

    this.idUnidad = null;

    this.idNucleoIg = null;

    this.idIg = null;

    this.brigadas = [];

    this.unidades = [];

    this.brigadasIg = [];

    if (!this.idNucleo) {
      return;
    }

    this.usersService.getBrigadas(this.idNucleo).subscribe({
      next: (data) => {
        this.brigadas = data || [];
      },

      error: (err) => {
        console.error('ERROR GRANDES UNIDADES QR4:', err);
      },
    });
  }

  // =========================================
  // CAMBIAR GRAN UNIDAD
  // =========================================

  cambiarBrigada(): void {
    this.idUnidad = null;

    this.idNucleoIg = null;

    this.idIg = null;

    this.unidades = [];

    this.brigadasIg = [];

    if (!this.idNucleo || !this.idBrigada) {
      return;
    }

    this.usersService.getUnidades(this.idNucleo, this.idBrigada).subscribe({
      next: (data) => {
        this.unidades = data || [];
      },

      error: (err) => {
        console.error('ERROR UNIDADES QR4:', err);
      },
    });
  }

  // =========================================
  // CAMBIAR UNIDAD
  //
  // AUTOCOMPLETA:
  // NÚCLEO IG
  // IG
  // =========================================

  cambiarUnidad(): void {
    const unidadSeleccionada = this.obtenerUnidadSeleccionada();

    if (!unidadSeleccionada) {
      this.idNucleoIg = null;

      this.idIg = null;

      this.brigadasIg = [];

      return;
    }

    // =======================================
    // NÚCLEO IG
    // =======================================

    this.idNucleoIg = Number(unidadSeleccionada.idNucleo);

    // =======================================
    // IG
    // =======================================

    const idIgAutomatico = unidadSeleccionada.idBrigada
      ? String(unidadSeleccionada.idBrigada)
      : null;

    this.idIg = null;

    this.brigadasIg = [];

    this.usersService
      .getBrigadas(String(unidadSeleccionada.idNucleo))
      .subscribe({
        next: (data) => {
          this.brigadasIg = data || [];

          this.idIg = idIgAutomatico;
        },

        error: (err) => {
          console.error('ERROR AUTOCOMPLETANDO IG QR4:', err);

          this.brigadasIg = [];

          this.idIg = null;
        },
      });
  }

  // =========================================
  // UNIDAD SELECCIONADA
  // =========================================

  obtenerUnidadSeleccionada(): Unidad | undefined {
    return this.unidades.find(
      (unidad: Unidad) => String(unidad.idUnidad) === String(this.idUnidad),
    );
  }

  // =========================================
  // NÚCLEO IG VISUAL
  //
  // V DIVISION DE EJERCITO - IQUITOS
  // =========================================

  obtenerNombreNucleoIg(nucleo: Nucleo): string {
    const nombre = String(nucleo?.nombre || '').trim();

    const unidadSeleccionada = this.obtenerUnidadSeleccionada();

    if (
      unidadSeleccionada &&
      String(unidadSeleccionada.idNucleo) === String(nucleo.idNucleo) &&
      unidadSeleccionada.guarnicion
    ) {
      return nombre + ' - ' + String(unidadSeleccionada.guarnicion).trim();
    }

    return nombre;
  }

  // =========================================
  // OBTENER NOMBRE IG
  // =========================================

  obtenerNombreIg(): string {
    if (!this.idIg) {
      return '';
    }

    const ig = this.brigadasIg.find(
      (brigada: Brigada) => String(brigada.idBrigada) === String(this.idIg),
    );

    return ig?.nombre || '';
  }

  // =========================================
  // NÚCLEO IG SELECCIONADO
  // =========================================

  obtenerNucleoIgSeleccionado(): Nucleo | undefined {
    if (this.idNucleoIg === null) {
      return undefined;
    }

    return this.nucleosIg.find(
      (nucleo: Nucleo) => String(nucleo.idNucleo) === String(this.idNucleoIg),
    );
  }

  // =========================================
  // SELECCIONAR PDFs
  // =========================================

  seleccionarArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const seleccionados = Array.from(input.files ?? []);
    input.value = '';

    const maxTamano = 1024 * 1024 * 1024;
    const nuevos: File[] = [];
    const rechazados: string[] = [];

    for (const archivo of seleccionados) {
      if (archivo.type !== 'application/pdf' || !archivo.name.toLowerCase().endsWith('.pdf')) {
        rechazados.push(`${archivo.name}: solo se permiten archivos PDF.`);
      } else if (archivo.size > maxTamano) {
        rechazados.push(`${archivo.name}: supera el máximo de 1 GB.`);
      } else if (this.archivos.length + nuevos.length >= 5) {
        rechazados.push(`${archivo.name}: ya hay 5 PDF adjuntos.`);
      } else {
        nuevos.push(archivo);
      }
    }

    this.archivos = [...this.archivos, ...nuevos];

    if (rechazados.length > 0) {
      void Swal.fire({
        icon: 'warning',
        title: 'Archivos no adjuntados',
        text: rechazados.join(' · '),
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#145c43',
      });
    }
  }

  // =========================================
  // QUITAR PDF
  // =========================================

  quitarArchivo(index: number): void {
    this.archivos = this.archivos.filter((_archivo, i) => i !== index);
  }

  // =========================================
  // TAMAÑO PDF
  // =========================================

  formatearTamano(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }

    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // =========================================
  // LIMPIAR
  // =========================================

  limpiarFormulario(): void {
    this.cargarDatosPersona();

    this.idTipoExpediente = null;

    this.idTipoDocumento = null;

    this.idTipificacion = null;

    this.otroTipoDocumento = '';

    this.idNucleo = null;

    this.idBrigada = null;

    this.idUnidad = null;

    this.idNucleoIg = null;

    this.idIg = null;

    this.nroDocumento = '';

    this.fechaDocumento = '';

    this.asunto = '';

    this.descripcion = '';

    this.tipificaciones = [];

    this.brigadas = [];

    this.unidades = [];

    this.brigadasIg = [];

    this.archivos = [];

    const inputArchivo = document.querySelector(
      '.input-archivo-registro-qr3',
    ) as HTMLInputElement;

    if (inputArchivo) {
      inputArchivo.value = '';
    }
  }

  // =========================================
  // CANCELAR
  // =========================================

  cancelar(): void {
    if (this.guardando) {
      return;
    }

    this.limpiarFormulario();

    this.cerrarModal.emit();
  }

  // =========================================
  // CERRAR ÉXITO
  // =========================================

  cerrarExito(): void {
    this.mostrarExito = false;

    this.cinvGenerado = '';

    this.cerrarModal.emit();
  }

  // =========================================
  // GUARDAR
  // =========================================

  guardar(): void {
    if (this.guardando) {
      return;
    }

    const errorPersona =
      this.obtenerErrorPersona('ruc') ||
      this.obtenerErrorPersona('dni') ||
      this.obtenerErrorPersona('correo');

    if (errorPersona) {
      this.mostrarDatosPersona = true;
      alert(errorPersona);
      return;
    }

    // =======================================
    // CATEGORÍA
    // =======================================

    if (!this.idTipoExpediente) {
      alert('Seleccione una categoría.');

      return;
    }

    // =======================================
    // TIPO DOCUMENTO
    // =======================================

    if (!this.idTipoDocumento) {
      alert('Seleccione un tipo de documento.');

      return;
    }

    // =======================================
    // OTROS
    // =======================================

    if (this.esTipoDocumentoOtros() && !this.otroTipoDocumento.trim()) {
      alert('Especifique el tipo de documento.');

      return;
    }

    // =======================================
    // N° DOCUMENTO
    // =======================================

    if (!this.nroDocumento.trim()) {
      alert('Ingrese el número de documento.');

      return;
    }

    // =======================================
    // FECHA
    // =======================================

    if (!this.fechaDocumento) {
      alert('Seleccione la fecha del documento.');

      return;
    }

    // =======================================
    // TIPIFICACIÓN
    // =======================================

    if (!this.idTipificacion) {
      alert('Seleccione una tipificación.');

      return;
    }

    // =======================================
    // NÚCLEO
    // =======================================

    if (!this.idNucleo) {
      alert('Seleccione un núcleo.');

      return;
    }

    // =======================================
    // GRAN UNIDAD
    // =======================================

    if (!this.idBrigada) {
      alert('Seleccione una gran unidad.');

      return;
    }

    // =======================================
    // UNIDAD
    // =======================================

    if (!this.idUnidad) {
      alert('Seleccione una unidad.');

      return;
    }

    // =======================================
    // NÚCLEO IG
    // =======================================

    if (this.idNucleoIg === null) {
      alert('No se pudo determinar el Núcleo IG.');

      return;
    }

    // =======================================
    // IG
    // =======================================

    if (!this.idIg) {
      alert('No se pudo determinar la IG.');

      return;
    }

    // =======================================
    // ASUNTO
    // =======================================

    if (!this.asunto.trim()) {
      alert('Ingrese el asunto.');

      return;
    }

    // =======================================
    // DESCRIPCIÓN
    // =======================================

    if (!this.descripcion.trim()) {
      alert('Ingrese la descripción.');

      return;
    }

    // =======================================
    // PAYLOAD QRD NIVEL 4
    // =======================================

    const expediente = {

      datosPersona: this.obtenerDatosPersonaParaGuardar(),

      idTipoExpediente: this.idTipoExpediente,

      idTipoDocumento: this.idTipoDocumento,

      otroTipoDocumento: this.esTipoDocumentoOtros()
        ? this.otroTipoDocumento.trim()
        : null,

      idTipificacion: this.idTipificacion,

      idEstado: null,

      nroDocumento: this.nroDocumento.trim(),

      fechaDocumento: this.fechaDocumento,

      idNucleo: this.idNucleo,

      idBrigada: this.idBrigada,

      idUnidad: this.idUnidad,

      idNucleoIg: this.idNucleoIg,

      idIg: this.idIg,

      // =====================================
      // QRD NIVEL 4
      // =====================================

      nivelCreacion: 4,

      nivelActual: 4,

      // QRD4 NO COLOCA DESTINATARIO
      nivelDestino: null,

      asunto: this.asunto.trim(),

      descripcion: this.descripcion.trim(),
    };

    this.guardando = true;

    this.expedienteService
      .guardarExpediente(expediente, this.archivos)
      .subscribe({
        next: (response) => {
          this.guardando = false;

          this.cinvGenerado = response.cinv;

          this.documentoRegistrado.emit(response);

          this.limpiarFormulario();

          this.mostrarExito = true;
        },

        error: (err) => {
          this.guardando = false;

          console.error('ERROR AL GUARDAR QRD4:', err);

          alert(
            err?.error?.message ||
              err?.error ||
              'No se pudo registrar el documento QRD Nivel 4.',
          );
        },
      });
  }
}
