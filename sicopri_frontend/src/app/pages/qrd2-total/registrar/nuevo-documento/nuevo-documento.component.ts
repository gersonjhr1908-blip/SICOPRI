import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ExpedienteService
} from '../../../../services/expediente.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad
} from '../../../../services/users.service';


@Component({
  selector: 'app-nuevo-documento',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './nuevo-documento.component.html',

  styleUrl:
    './nuevo-documento.component.css'
})
export class NuevoDocumentoComponent
  implements OnInit {


  // =========================================
  // CATÁLOGOS
  // =========================================

  tiposExpediente: any[] =
    [];

  tiposDocumento: any[] =
    [];

  tipificaciones: any[] =
    [];


  // =========================================
  // UBICACIÓN ORIGINAL
  // =========================================

  nucleos: Nucleo[] =
    [];

  brigadas: Brigada[] =
    [];

  unidades: Unidad[] =
    [];


  // =========================================
  // UBICACIÓN IG
  // =========================================

  nucleosIg: Nucleo[] =
    [];

  brigadasIg: Brigada[] =
    [];


  // =========================================
  // IDS DOCUMENTO
  // =========================================

  idTipoExpediente:
    number | null =
    null;


  idTipoDocumento:
    number | null =
    null;


  idTipificacion:
    number | null =
    null;


  // =========================================
  // OTRO TIPO DOCUMENTO
  // =========================================

  otroTipoDocumento =
    '';


  // =========================================
  // UBICACIÓN ORIGINAL
  // =========================================

  idNucleo:
    string | null =
    null;


  idBrigada:
    string | null =
    null;


  idUnidad:
    string | null =
    null;


  // =========================================
  // UBICACIÓN IG
  // AUTOCOMPLETADA EN REGISTRO
  // =========================================

  idNucleoIg:
    number | null =
    null;


  idIg:
    string | null =
    null;


  // =========================================
  // DESTINO FINAL ELEGIDO POR QRD 2
  // =========================================

  nivelDestino:
    number | null =
    null;


  // =========================================
  // DATOS DOCUMENTO
  // =========================================

  nroDocumento =
    '';

  fechaDocumento =
    '';

  asunto =
    '';

  descripcion =
    '';


  // =========================================
  // PDFs
  // =========================================

  archivos:
    File[] =
    [];


  // =========================================
  // GUARDANDO
  // =========================================

  guardando =
    false;


  // =========================================
  // ÉXITO
  // =========================================

  mostrarExito =
    false;

  cinvGenerado =
    '';


  // =========================================
  // OUTPUTS
  // =========================================

  @Output()
  documentoRegistrado =
    new EventEmitter<any>();


  @Output()
  cerrarModal =
    new EventEmitter<void>();


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private expedienteService:
      ExpedienteService,

    private usersService:
      UsersService

  ) {}


  // =========================================
  // INICIO
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
    // CATEGORÍA QRD
    //
    // DENUNCIA / QUEJA / RECLAMO
    //
    // ID 5 = INTEGRIDAD
    // NO SE MUESTRA
    // =======================================

    this.expedienteService
      .getTiposExpediente()
      .subscribe({

        next: (
          data
        ) => {

          this.tiposExpediente =
            (data || []).filter(
              (
                tipo: any
              ) =>
                Number(
                  tipo.idTipoExpediente
                ) !== 5
            );

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR TIPOS EXPEDIENTE:',
            err
          );

        }

      });


    // =======================================
    // TIPO DOCUMENTO
    // =======================================

    this.expedienteService
      .getTiposDocumento()
      .subscribe({

        next: (
          data
        ) => {

          this.tiposDocumento =
            data || [];

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR TIPOS DOCUMENTO:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR CATEGORÍA QRD
  // =========================================

  cambiarTipoExpediente(): void {

    this.idTipificacion =
      null;


    this.tipificaciones =
      [];


    if (
      !this.idTipoExpediente
    ) {

      return;

    }


    this.expedienteService
      .getTipificaciones(
        this.idTipoExpediente
      )
      .subscribe({

        next: (
          data
        ) => {

          this.tipificaciones =
            data || [];

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR TIPIFICACIONES:',
            err
          );

        }

      });

  }


  // =========================================
  // TIPO DOCUMENTO OTROS
  // =========================================

  esTipoDocumentoOtros(): boolean {

    if (
      !this.idTipoDocumento
    ) {

      return false;

    }


    const tipo =
      this.tiposDocumento.find(
        (
          item: any
        ) =>
          Number(
            item.idTipoDocumento
          ) ===
          Number(
            this.idTipoDocumento
          )
      );


    const nombre =
      String(
        tipo?.nombre || ''
      )
        .trim()
        .toUpperCase();


    return nombre ===
      'OTROS';

  }


  // =========================================
  // CAMBIO TIPO DOCUMENTO
  // =========================================

  cambiarTipoDocumento(): void {

    if (
      !this.esTipoDocumentoOtros()
    ) {

      this.otroTipoDocumento =
        '';

    }

  }


  // =========================================
  // CARGAR NÚCLEOS
  // =========================================

  cargarNucleos(): void {

    this.usersService
      .getNucleos()
      .subscribe({

        next: (
          data
        ) => {

          this.nucleos =
            data || [];


          // Catálogo base que usaremos
          // para mostrar el Núcleo IG
          // autocompletado.

          this.nucleosIg =
            data || [];

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL CARGAR NÚCLEOS:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR NÚCLEO
  // =========================================

  cambiarNucleo(): void {

    this.idBrigada =
      null;


    this.idUnidad =
      null;


    this.idNucleoIg =
      null;


    this.idIg =
      null;


    this.brigadas =
      [];


    this.unidades =
      [];


    this.brigadasIg =
      [];


    if (
      !this.idNucleo
    ) {

      return;

    }


    this.usersService
      .getBrigadas(
        this.idNucleo
      )
      .subscribe({

        next: (
          data
        ) => {

          this.brigadas =
            data || [];

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL CARGAR GRANDES UNIDADES:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR GRAN UNIDAD
  // =========================================

  cambiarBrigada(): void {

    this.idUnidad =
      null;


    this.idNucleoIg =
      null;


    this.idIg =
      null;


    this.unidades =
      [];


    this.brigadasIg =
      [];


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
          data
        ) => {

          this.unidades =
            data || [];

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL CARGAR UNIDADES:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR UNIDAD
  //
  // AUTOCOMPLETA:
  //
  // NÚCLEO IG
  // IG
  // =========================================

  cambiarUnidad(): void {

    const unidadSeleccionada =
      this.obtenerUnidadSeleccionada();


    if (
      !unidadSeleccionada
    ) {

      this.idNucleoIg =
        null;


      this.idIg =
        null;


      this.brigadasIg =
        [];


      return;

    }


    // =======================================
    // NÚCLEO IG
    //
    // Sale del IDNUCLEO de la unidad.
    // =======================================

    this.idNucleoIg =
      Number(
        unidadSeleccionada.idNucleo
      );


    // =======================================
    // IG
    //
    // Sale del IDBRIGADA de la unidad.
    // =======================================

    const idIgAutomatico =
      unidadSeleccionada.idBrigada
        ? String(
            unidadSeleccionada.idBrigada
          )
        : null;


    this.idIg =
      null;


    this.brigadasIg =
      [];


    // =======================================
    // CARGAR BRIGADAS DEL NÚCLEO
    // =======================================

    this.usersService
      .getBrigadas(
        String(
          unidadSeleccionada.idNucleo
        )
      )
      .subscribe({

        next: (
          data
        ) => {


          this.brigadasIg =
            data || [];


          // =================================
          // AUTOCOMPLETAR IG
          // =================================

          this.idIg =
            idIgAutomatico;

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AUTOCOMPLETANDO IG:',
            err
          );


          this.brigadasIg =
            [];


          this.idIg =
            null;

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
  //
  // EJEMPLO:
  //
  // V DIVISION DE EJERCITO - IQUITOS
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
      unidadSeleccionada
      &&
      String(
        unidadSeleccionada.idNucleo
      ) ===
      String(
        nucleo.idNucleo
      )
      &&
      unidadSeleccionada.guarnicion
    ) {

      return (
        nombre
        +
        ' - '
        +
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

    if (
      !this.idIg
    ) {

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
  // OBTENER NÚCLEO IG SELECCIONADO
  // =========================================

  obtenerNucleoIgSeleccionado():
    Nucleo | undefined {

    if (
      this.idNucleoIg === null
    ) {

      return undefined;

    }


    return this.nucleosIg.find(
      (
        nucleo: Nucleo
      ) =>
        String(
          nucleo.idNucleo
        ) ===
        String(
          this.idNucleoIg
        )
    );

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
      !input.files
    ) {

      return;

    }


    const seleccionados:
      File[] =
      Array.from(
        input.files
      );


    // =======================================
    // MÁXIMO 5
    // =======================================

    if (
      seleccionados.length > 5
    ) {

      alert(
        'Solo puedes adjuntar un máximo de 5 archivos PDF.'
      );


      input.value =
        '';


      this.archivos =
        [];


      return;

    }


    // =======================================
    // SOLO PDF
    // =======================================

    const archivoInvalido =
      seleccionados.some(
        (
          archivo: File
        ) =>

          archivo.type !==
            'application/pdf'

          ||

          !archivo.name
            .toLowerCase()
            .endsWith(
              '.pdf'
            )
      );


    if (
      archivoInvalido
    ) {

      alert(
        'Solo se permiten archivos PDF.'
      );


      input.value =
        '';


      this.archivos =
        [];


      return;

    }


    // =======================================
    // MÁXIMO 10 MB
    // =======================================

    const maxTamano =
      10 *
      1024 *
      1024;


    const archivoGrande =
      seleccionados.some(
        (
          archivo: File
        ) =>
          archivo.size >
          maxTamano
      );


    if (
      archivoGrande
    ) {

      alert(
        'Cada archivo PDF debe pesar como máximo 10 MB.'
      );


      input.value =
        '';


      this.archivos =
        [];


      return;

    }


    this.archivos =
      seleccionados;

  }


  // =========================================
  // QUITAR PDF SELECCIONADO
  // =========================================

  quitarArchivo(
    index: number
  ): void {

    this.archivos =
      this.archivos.filter(
        (
          _archivo,
          i
        ) =>
          i !== index
      );

  }


  // =========================================
  // FORMATEAR TAMAÑO
  // =========================================

  formatearTamano(
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
        (
          bytes /
          1024
        ).toFixed(1)
        +
        ' KB'
      );

    }


    return (
      (
        bytes /
        (
          1024 *
          1024
        )
      ).toFixed(1)
      +
      ' MB'
    );

  }


  // =========================================
  // LIMPIAR FORMULARIO
  // =========================================

  limpiarFormulario(): void {

    this.idTipoExpediente =
      null;


    this.idTipoDocumento =
      null;


    this.idTipificacion =
      null;


    this.otroTipoDocumento =
      '';


    this.idNucleo =
      null;


    this.idBrigada =
      null;


    this.idUnidad =
      null;


    this.idNucleoIg =
      null;


    this.idIg =
      null;


    this.nivelDestino =
      null;


    this.nroDocumento =
      '';


    this.fechaDocumento =
      '';


    this.asunto =
      '';


    this.descripcion =
      '';


    this.tipificaciones =
      [];


    this.brigadas =
      [];


    this.unidades =
      [];


    this.brigadasIg =
      [];


    this.archivos =
      [];


    const inputArchivo =
      document.querySelector(
        '.input-archivo-registro'
      ) as HTMLInputElement;


    if (
      inputArchivo
    ) {

      inputArchivo.value =
        '';

    }

  }


  // =========================================
  // CANCELAR
  // =========================================

  cancelar(): void {

    if (
      this.guardando
    ) {

      return;

    }


    this.limpiarFormulario();


    this.cerrarModal.emit();

  }


  // =========================================
  // CERRAR ÉXITO
  // =========================================

  cerrarExito(): void {

    this.mostrarExito =
      false;


    this.cinvGenerado =
      '';


    this.cerrarModal.emit();

  }


  // =========================================
  // GUARDAR
  // =========================================

  guardar(): void {


    if (
      this.guardando
    ) {

      return;

    }


    // =======================================
    // CATEGORÍA
    // =======================================

    if (
      !this.idTipoExpediente
    ) {

      alert(
        'Seleccione una categoría.'
      );

      return;

    }


    // =======================================
    // TIPO DOC
    // =======================================

    if (
      !this.idTipoDocumento
    ) {

      alert(
        'Seleccione un tipo de documento.'
      );

      return;

    }


    // =======================================
    // OTRO TIPO DOC
    // =======================================

    if (
      this.esTipoDocumentoOtros()
      &&
      !this.otroTipoDocumento.trim()
    ) {

      alert(
        'Especifique el tipo de documento.'
      );

      return;

    }


    // =======================================
    // N° DOC
    // =======================================

    if (
      !this.nroDocumento.trim()
    ) {

      alert(
        'Ingrese el número de documento.'
      );

      return;

    }


    // =======================================
    // FECHA
    // =======================================

    if (
      !this.fechaDocumento
    ) {

      alert(
        'Seleccione la fecha del documento.'
      );

      return;

    }


    // =======================================
    // TIPIFICACIÓN
    // =======================================

    if (
      !this.idTipificacion
    ) {

      alert(
        'Seleccione una tipificación.'
      );

      return;

    }


    // =======================================
    // NÚCLEO
    // =======================================

    if (
      !this.idNucleo
    ) {

      alert(
        'Seleccione un núcleo.'
      );

      return;

    }


    // =======================================
    // GRAN UNIDAD
    // =======================================

    if (
      !this.idBrigada
    ) {

      alert(
        'Seleccione una gran unidad.'
      );

      return;

    }


    // =======================================
    // UNIDAD
    // =======================================

    if (
      !this.idUnidad
    ) {

      alert(
        'Seleccione una unidad.'
      );

      return;

    }


    // =======================================
    // NÚCLEO IG AUTOMÁTICO
    // =======================================

    if (
      this.idNucleoIg === null
    ) {

      alert(
        'No se pudo determinar el Núcleo IG.'
      );

      return;

    }


    // =======================================
    // IG AUTOMÁTICO
    // =======================================

    if (
      !this.idIg
    ) {

      alert(
        'No se pudo determinar la IG.'
      );

      return;

    }


    // =======================================
    // DESTINO
    // =======================================

    if (
      this.nivelDestino !== 3
      &&
      this.nivelDestino !== 4
    ) {

      alert(
        'Seleccione el destino del expediente.'
      );

      return;

    }


    // =======================================
    // ASUNTO
    // =======================================

    if (
      !this.asunto.trim()
    ) {

      alert(
        'Ingrese el asunto.'
      );

      return;

    }


    // =======================================
    // DESCRIPCIÓN
    // =======================================

    if (
      !this.descripcion.trim()
    ) {

      alert(
        'Ingrese la descripción.'
      );

      return;

    }


    // =======================================
    // EXPEDIENTE
    // =======================================

    const expediente = {


      // =====================================
      // CATEGORÍA QRD
      // =====================================

      idTipoExpediente:
        this.idTipoExpediente,


      // =====================================
      // TIPO DOCUMENTO
      // =====================================

      idTipoDocumento:
        this.idTipoDocumento,


      otroTipoDocumento:
        this.esTipoDocumentoOtros()
          ? this.otroTipoDocumento.trim()
          : null,


      // =====================================
      // TIPIFICACIÓN
      // =====================================

      idTipificacion:
        this.idTipificacion,


      // Backend coloca REGISTRADO
      idEstado:
        null,


      // =====================================
      // N° DOC
      // =====================================

      nroDocumento:
        this.nroDocumento.trim(),


      // =====================================
      // FECHA
      // =====================================

      fechaDocumento:
        this.fechaDocumento,


      // =====================================
      // UBICACIÓN
      // =====================================

      idNucleo:
        this.idNucleo,


      idBrigada:
        this.idBrigada,


      idUnidad:
        this.idUnidad,


      // =====================================
      // INSPECTORÍA
      // =====================================

      idNucleoIg:
        this.idNucleoIg,


      idIg:
        this.idIg,


      // =====================================
      // DESTINO FINAL
      // =====================================

      nivelDestino:
        this.nivelDestino,


      // =====================================
      // CONTENIDO
      // =====================================

      asunto:
        this.asunto.trim(),


      descripcion:
        this.descripcion.trim()

    };


    console.log(
      'EXPEDIENTE QRD A GUARDAR:',
      expediente
    );


    // =======================================
    // GUARDANDO
    // =======================================

    this.guardando =
      true;


    this.expedienteService
      .guardarExpediente(
        expediente,
        this.archivos
      )
      .subscribe({

        next: (
          response
        ) => {

          this.guardando =
            false;


          this.cinvGenerado =
            response.cinv;


          this.documentoRegistrado.emit(
            response
          );


          this.limpiarFormulario();


          this.mostrarExito =
            true;

        },


        error: (
          err
        ) => {

          this.guardando =
            false;


          console.error(
            'ERROR AL GUARDAR QRD:',
            err
          );


          alert(
            err?.error?.message ||
            err?.error ||
            'No se pudo registrar el documento.'
          );

        }

      });

  }

}