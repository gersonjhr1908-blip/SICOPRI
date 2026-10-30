import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  IntegridadService
} from '../../../../services/integridad.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad
} from '../../../../services/users.service';


@Component({
  selector: 'app-nuevo-registro-integridad',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './nuevo-registro-integridad.component.html',

  styleUrl:
    './nuevo-registro-integridad.component.css'
})
export class NuevoRegistroIntegridadComponent
  implements OnInit {


  // =========================================
  // AVISAR AL COMPONENTE PADRE
  // =========================================

  @Output()
  guardado =
    new EventEmitter<any>();


  // =========================================
  // DATOS DEL DENUNCIANTE
  // =========================================

  identificacion: string | null = null;

  nombres: string = '';

  apellidos: string = '';

  ruc: string = '';

  dni: string = '';

  telefono: string = '';

  domicilio: string = '';

  correo: string = '';

  sexo: string | null = null;


  // =========================================
  // DATOS DEL DOCUMENTO
  // =========================================

  tipoDocumento: string | null = null;

  codigo: string = '';

  fechaRegistro: string = '';


  // =========================================
  // DATOS DE LA DENUNCIA
  // =========================================

  fechaActoCorrupcion: string = '';

  motivoDenuncia: string | null = null;

  medidaProteccion: string | null = null;

  detalle: string = '';

  detalleOtros: string = '';


  // =========================================
  // UBICACIÓN ORIGINAL
  // =========================================

  nucleos: Nucleo[] = [];

  brigadas: Brigada[] = [];

  unidades: Unidad[] = [];

  idNucleo: string | null = null;

  idBrigada: string | null = null;

  idUnidad: string | null = null;


  // =========================================
  // UBICACIÓN IG AUTOMÁTICA
  // =========================================

  nucleosIg: Nucleo[] = [];

  brigadasIg: Brigada[] = [];

  idNucleoIg: number | null = null;

  idIg: string | null = null;


  // =========================================
  // PDFs
  // =========================================

  archivos: File[] = [];

  maxArchivos: number = 5;

  maxTamanoPdf: number =
    10 * 1024 * 1024;


  // =========================================
  // CONTROL
  // =========================================

  guardando: boolean = false;

  intentoGuardar: boolean = false;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private integridadService:
      IntegridadService,

    private usersService:
      UsersService
  ) {}


  // =========================================
  // INICIO
  // =========================================

  ngOnInit(): void {
    this.cargarNucleos();
  }


  // =========================================
  // DENUNCIANTE IDENTIFICADO
  // =========================================

  get esIdentificado(): boolean {
    return this.identificacion ===
      'DENUNCIANTE';
  }


  // =========================================
  // VALIDAR CONTACTO
  // =========================================

  get errorContacto(): string {
    const dni =
      this.dni.trim();

    const ruc =
      this.ruc.trim();

    const telefono =
      this.telefono.trim();

    const correo =
      this.correo.trim();


    if (
      this.esIdentificado &&
      !dni
    ) {
      return 'El DNI es obligatorio para el denunciante identificado.';
    }


    if (
      dni &&
      !/^\d{8}$/.test(dni)
    ) {
      return 'El DNI debe contener exactamente 8 dígitos.';
    }


    if (
      ruc &&
      !/^\d{11}$/.test(ruc)
    ) {
      return 'El RUC debe contener exactamente 11 dígitos.';
    }


    if (
      this.esIdentificado &&
      !telefono
    ) {
      return 'El teléfono es obligatorio para el denunciante identificado.';
    }


    if (
      correo &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        correo
      )
    ) {
      return 'Ingrese un correo electrónico válido.';
    }


    return '';
  }


  // =========================================
  // VALIDAR ASIGNACIÓN
  // =========================================

  get asignacionInvalida(): boolean {
    return (
      !this.idNucleo ||
      !this.idBrigada ||
      !this.idUnidad ||
      this.idNucleoIg === null ||
      !this.idIg
    );
  }


  // =========================================
  // CARGAR NÚCLEOS
  // =========================================

  cargarNucleos(): void {
    this.usersService
      .getNucleos()
      .subscribe({

        next: (
          data: Nucleo[]
        ) => {
          this.nucleos =
            data || [];

          this.nucleosIg =
            data || [];
        },

        error: (
          error: any
        ) => {
          console.error(
            'ERROR AL CARGAR NÚCLEOS DE INTEGRIDAD:',
            error
          );

          this.nucleos = [];

          this.nucleosIg = [];
        }

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


    this.usersService
      .getBrigadas(
        this.idNucleo
      )
      .subscribe({

        next: (
          data: Brigada[]
        ) => {
          this.brigadas =
            data || [];
        },

        error: (
          error: any
        ) => {
          console.error(
            'ERROR AL CARGAR GRANDES UNIDADES:',
            error
          );

          this.brigadas = [];
        }

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


    if (
      !this.idNucleo ||
      !this.idBrigada
    ) {
      return;
    }


    this.usersService
      .getUnidades(
        this.idNucleo,
        this.idBrigada
      )
      .subscribe({

        next: (
          data: Unidad[]
        ) => {
          this.unidades =
            data || [];
        },

        error: (
          error: any
        ) => {
          console.error(
            'ERROR AL CARGAR UNIDADES:',
            error
          );

          this.unidades = [];
        }

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
    const unidadSeleccionada =
      this.obtenerUnidadSeleccionada();


    if (!unidadSeleccionada) {
      this.idNucleoIg = null;

      this.idIg = null;

      this.brigadasIg = [];

      return;
    }


    this.idNucleoIg =
      Number(
        unidadSeleccionada.idNucleo
      );


    const idIgAutomatico =
      unidadSeleccionada.idBrigada
        ? String(
            unidadSeleccionada.idBrigada
          )
        : null;


    this.idIg = null;

    this.brigadasIg = [];


    this.usersService
      .getBrigadas(
        String(
          unidadSeleccionada.idNucleo
        )
      )
      .subscribe({

        next: (
          data: Brigada[]
        ) => {
          this.brigadasIg =
            data || [];

          this.idIg =
            idIgAutomatico;
        },

        error: (
          error: any
        ) => {
          console.error(
            'ERROR AUTOCOMPLETANDO IG:',
            error
          );

          this.brigadasIg = [];

          this.idIg = null;
        }

      });
  }


  // =========================================
  // OBTENER UNIDAD SELECCIONADA
  // =========================================

  obtenerUnidadSeleccionada():
    Unidad | undefined {

    return this.unidades.find(
      (
        unidad: Unidad
      ) =>
        String(
          unidad.idUnidad
        ) ===
        String(
          this.idUnidad
        )
    );
  }


  // =========================================
  // NOMBRE VISUAL NÚCLEO IG
  // =========================================

  obtenerNombreNucleoIg(
    nucleo: Nucleo
  ): string {

    const nombre =
      String(
        nucleo?.nombre || ''
      ).trim();


    const unidadSeleccionada =
      this.obtenerUnidadSeleccionada();


    if (
      unidadSeleccionada &&
      String(
        unidadSeleccionada.idNucleo
      ) ===
      String(
        nucleo.idNucleo
      ) &&
      unidadSeleccionada.guarnicion
    ) {
      return (
        nombre +
        ' - ' +
        String(
          unidadSeleccionada.guarnicion
        ).trim()
      );
    }


    return nombre;
  }


  // =========================================
  // NOMBRE VISUAL IG
  // =========================================

  obtenerNombreIg(): string {
    if (!this.idIg) {
      return '';
    }


    const ig =
      this.brigadasIg.find(
        (
          brigada: Brigada
        ) =>
          String(
            brigada.idBrigada
          ) ===
          String(
            this.idIg
          )
      );


    return ig?.nombre || '';
  }


  // =========================================
  // SELECCIONAR PDFs
  // =========================================

  seleccionarArchivos(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }


    const seleccionados =
      Array.from(
        input.files
      );


    const pdfValidos =
      seleccionados.filter(
        (
          archivo: File
        ) => {

          const esPdf =
            archivo.type ===
              'application/pdf'
            ||
            archivo.name
              .toLowerCase()
              .endsWith('.pdf');


          if (!esPdf) {
            alert(
              `El archivo "${archivo.name}" no es PDF.`
            );

            return false;
          }


          if (
            archivo.size >
            this.maxTamanoPdf
          ) {
            alert(
              `El archivo "${archivo.name}" supera los 10 MB.`
            );

            return false;
          }


          return true;
        }
      );


    const nuevos =
      pdfValidos.filter(
        (
          archivo: File
        ) =>
          !this.archivos.some(
            (
              existente: File
            ) =>
              existente.name ===
                archivo.name
              &&
              existente.size ===
                archivo.size
          )
      );


    if (
      this.archivos.length +
      nuevos.length >
      this.maxArchivos
    ) {
      alert(
        `Solo se permiten máximo ${this.maxArchivos} archivos PDF.`
      );

      input.value = '';

      return;
    }


    this.archivos = [
      ...this.archivos,
      ...nuevos
    ];


    input.value = '';
  }


  // =========================================
  // ELIMINAR PDF
  // =========================================

  eliminarArchivo(
    index: number
  ): void {

    this.archivos.splice(
      index,
      1
    );


    this.archivos = [
      ...this.archivos
    ];
  }


  // =========================================
  // TAMAÑO PDF
  // =========================================

  obtenerTamanoArchivo(
    bytes: number
  ): string {

    if (
      bytes < 1024
    ) {
      return `${bytes} B`;
    }


    if (
      bytes <
      1024 * 1024
    ) {
      return (
        bytes / 1024
      ).toFixed(1) + ' KB';
    }


    return (
      bytes /
      (1024 * 1024)
    ).toFixed(1) + ' MB';
  }


  // =========================================
  // GUARDAR
  // =========================================

  guardar(): void {
    this.intentoGuardar = true;


    if (!this.identificacion) {
      alert(
        'Debe seleccionar la identificación del denunciante.'
      );

      return;
    }


    if (this.errorContacto) {
      alert(
        this.errorContacto
      );

      return;
    }


    if (!this.fechaActoCorrupcion) {
      alert(
        'Debe ingresar la fecha del acto de corrupción.'
      );

      return;
    }


    if (!this.motivoDenuncia) {
      alert(
        'Debe seleccionar el motivo de la denuncia.'
      );

      return;
    }


    if (this.asignacionInvalida) {
      alert(
        'Debe seleccionar Núcleo, Gran Unidad y Unidad.'
      );

      return;
    }


    if (this.guardando) {
      return;
    }


    // =======================================
    // EXPEDIENTE GENERAL
    // =======================================

    const expediente = {
      categoria:
        'INTEGRIDAD',

      nroDocumento:
        this.codigo.trim() || null,

      descripcion:
        this.detalle.trim() || null,

      idNucleo:
        this.idNucleo,

      idBrigada:
        this.idBrigada,

      idUnidad:
        this.idUnidad,

      idNucleoIg:
        this.idNucleoIg,

      idIg:
        this.idIg
    };


    // =======================================
    // DATOS PROPIOS DE INTEGRIDAD
    // =======================================

    const datosIntegridad = {
      tipoDocumento:
        this.tipoDocumento,

      nombres:
        this.nombres.trim(),

      apellidos:
        this.apellidos.trim(),

      ruc:
        this.ruc.trim(),

      dni:
        this.dni.trim(),

      telefono:
        this.telefono.trim(),

      domicilio:
        this.domicilio.trim(),

      correo:
        this.correo.trim(),

      fechaActoCorrupcion:
        this.fechaActoCorrupcion,

      motivoDenuncia:
        this.motivoDenuncia,

      medidaProteccion:
        this.medidaProteccion,

      identificacion:
        this.identificacion,

      sexo:
        this.sexo,

      detalle:
        this.detalle.trim(),

      detalleOtros:
        this.detalleOtros.trim()
    };


    this.guardando = true;


    this.integridadService
      .guardarDenuncia(
        expediente,
        datosIntegridad,
        this.archivos
      )
      .subscribe({

        next: (
          respuesta: any
        ) => {
          this.guardando = false;

          console.log(
            'DENUNCIA INTEGRIDAD GUARDADA:',
            respuesta
          );

          this.limpiarFormulario();

          this.guardado.emit(
            respuesta
          );
        },

        error: (
          error: any
        ) => {
          this.guardando = false;

          console.error(
            'ERROR AL GUARDAR DENUNCIA DE INTEGRIDAD:',
            error
          );


          let mensaje =
            'No se pudo registrar la denuncia.';


          if (
            error?.error?.message
          ) {
            mensaje =
              error.error.message;
          }

          else if (
            error?.error?.mensaje
          ) {
            mensaje =
              error.error.mensaje;
          }

          else if (
            typeof error?.error ===
            'string'
          ) {
            mensaje =
              error.error;
          }


          alert(
            mensaje
          );
        }

      });
  }


  // =========================================
  // LIMPIAR FORMULARIO
  // =========================================

  limpiarFormulario(): void {
    this.identificacion = null;

    this.nombres = '';

    this.apellidos = '';

    this.ruc = '';

    this.dni = '';

    this.telefono = '';

    this.domicilio = '';

    this.correo = '';

    this.sexo = null;

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

    this.idNucleoIg = null;

    this.idIg = null;

    this.brigadas = [];

    this.unidades = [];

    this.brigadasIg = [];

    this.archivos = [];

    this.intentoGuardar = false;
  }

}