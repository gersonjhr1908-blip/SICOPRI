import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import Swal from 'sweetalert2';

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
  selector: 'app-editar-documento-qrd3',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './editar-documento-qrd3.component.html',

  styleUrl:
    './editar-documento-qrd3.component.css'
})
export class EditarDocumentoQrd3Component
  implements OnChanges {


  // =========================================
  // EXPEDIENTE
  // =========================================

  @Input()
  expediente: any =
    null;


  // =========================================
  // OUTPUTS
  // =========================================

  @Output()
  cerrar =
    new EventEmitter<void>();


  @Output()
  actualizado =
    new EventEmitter<any>();


  // =========================================
  // FORMULARIO
  // =========================================

  formulario: any = {

    idExpediente:
      null,

    idTipoExpediente:
      null,

    idTipoDocumento:
      null,

    otroTipoDocumento:
      '',

    nroDocumento:
      '',

    fechaDocumento:
      '',

    idTipificacion:
      null,

    idNucleo:
      null,

    idBrigada:
      null,

    idUnidad:
      null,

    idNucleoIg:
      null,

    idIg:
      null,

    asunto:
      '',

    descripcion:
      ''

  };


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

  igs: Brigada[] =
    [];


  // =========================================
  // PDFs EXISTENTES
  // =========================================

  archivosActuales: any[] =
    [];


  // =========================================
  // PDFs NUEVOS
  // =========================================

  archivosNuevos: File[] =
    [];


  // =========================================
  // ESTADOS
  // =========================================

  guardando =
    false;

  cargandoArchivos =
    false;

  eliminandoArchivo:
    number | null =
    null;

  error =
    '';


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
  // CAMBIO DE EXPEDIENTE
  // =========================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['expediente'] &&
      this.expediente
    ) {

      this.inicializarEdicion();

    }

  }


  // =========================================
  // INICIALIZAR
  // =========================================

  inicializarEdicion(): void {

    this.error =
      '';


    this.archivosNuevos =
      [];


    this.brigadas =
      [];


    this.unidades =
      [];


    this.igs =
      [];


    this.tipificaciones =
      [];


    this.cargarFormulario();

    this.cargarCatalogos();

    this.cargarNucleos();

    this.cargarArchivosActuales();

  }


  // =========================================
  // CARGAR FORMULARIO
  // =========================================

  cargarFormulario(): void {

    this.formulario = {

      idExpediente:
        this.expediente?.idExpediente ?? null,


      idTipoExpediente:
        this.expediente?.idTipoExpediente ?? null,


      idTipoDocumento:
        this.expediente?.idTipoDocumento ?? null,


      otroTipoDocumento:
        this.expediente?.otroTipoDocumento || '',


      nroDocumento:
        this.expediente?.nroDocumento || '',


      fechaDocumento:
        this.expediente?.fechaDocumento || '',


      idTipificacion:
        this.expediente?.idTipificacion ?? null,


      idNucleo:
        this.expediente?.idNucleo
          ? String(
              this.expediente.idNucleo
            )
          : null,


      idBrigada:
        this.expediente?.idBrigada
          ? String(
              this.expediente.idBrigada
            )
          : null,


      idUnidad:
        this.expediente?.idUnidad
          ? String(
              this.expediente.idUnidad
            )
          : null,


      idNucleoIg:
        this.expediente?.idNucleoIg !== null &&
        this.expediente?.idNucleoIg !== undefined
          ? String(
              this.expediente.idNucleoIg
            )
          : null,


      idIg:
        this.expediente?.idIg
          ? String(
              this.expediente.idIg
            )
          : null,


      asunto:
        this.expediente?.asunto || '',


      descripcion:
        this.expediente?.descripcion || ''

    };

  }


  // =========================================
  // CATÁLOGOS
  // =========================================

  cargarCatalogos(): void {


    this.expedienteService
      .getTiposExpediente()
      .subscribe({

        next: (
          data
        ) => {

          this.tiposExpediente =
            (data || [])
              .filter(
                (
                  tipo: any
                ) =>
                  Number(
                    tipo.idTipoExpediente
                  ) !== 5
              );


          if (
            this.formulario.idTipoExpediente
          ) {

            this.cargarTipificaciones();

          }

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR TIPOS EXPEDIENTE QR3:',
            err
          );

        }

      });


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
            'ERROR TIPOS DOCUMENTO QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // TIPIFICACIONES
  // =========================================

  cargarTipificaciones(): void {

    if (
      !this.formulario.idTipoExpediente
    ) {

      this.tipificaciones =
        [];

      return;

    }


    this.expedienteService
      .getTipificaciones(
        Number(
          this.formulario.idTipoExpediente
        )
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
            'ERROR TIPIFICACIONES QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR CATEGORÍA
  // =========================================

  cambiarTipoExpediente(): void {

    this.formulario.idTipificacion =
      null;


    this.tipificaciones =
      [];


    this.cargarTipificaciones();

  }


  // =========================================
  // TIPO DOCUMENTO OTROS
  // =========================================

  esTipoDocumentoOtros(): boolean {

    if (
      !this.formulario.idTipoDocumento
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
            this.formulario.idTipoDocumento
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

      this.formulario.otroTipoDocumento =
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


          this.nucleosIg =
            data || [];


          if (
            this.formulario.idNucleo
          ) {

            this.cargarBrigadasIniciales();

          }


          if (
            this.formulario.idNucleoIg
          ) {

            this.cargarIgsIniciales();

          }

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR NÚCLEOS QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // PRECARGAR BRIGADAS
  // =========================================

  cargarBrigadasIniciales(): void {

    const idNucleoActual =
      this.formulario.idNucleo;


    const idBrigadaActual =
      this.formulario.idBrigada;


    if (
      !idNucleoActual
    ) {

      return;

    }


    this.usersService
      .getBrigadas(
        String(
          idNucleoActual
        )
      )
      .subscribe({

        next: (
          data
        ) => {

          this.brigadas =
            data || [];


          this.formulario.idBrigada =
            idBrigadaActual;


          if (
            this.formulario.idBrigada
          ) {

            this.cargarUnidadesIniciales();

          }

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR BRIGADAS INICIALES QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // PRECARGAR UNIDADES
  // =========================================

  cargarUnidadesIniciales(): void {

    const idUnidadActual =
      this.formulario.idUnidad;


    if (
      !this.formulario.idNucleo ||
      !this.formulario.idBrigada
    ) {

      return;

    }


    this.usersService
      .getUnidades(

        String(
          this.formulario.idNucleo
        ),

        String(
          this.formulario.idBrigada
        )

      )
      .subscribe({

        next: (
          data
        ) => {

          this.unidades =
            data || [];


          this.formulario.idUnidad =
            idUnidadActual;

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR UNIDADES INICIALES QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR NÚCLEO
  // =========================================

  cambiarNucleo(): void {

    this.formulario.idBrigada =
      null;


    this.formulario.idUnidad =
      null;


    this.brigadas =
      [];


    this.unidades =
      [];


    if (
      !this.formulario.idNucleo
    ) {

      return;

    }


    this.usersService
      .getBrigadas(
        String(
          this.formulario.idNucleo
        )
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
            'ERROR GRANDES UNIDADES QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR BRIGADA
  // =========================================

  cambiarBrigada(): void {

    this.formulario.idUnidad =
      null;


    this.unidades =
      [];


    if (
      !this.formulario.idNucleo ||
      !this.formulario.idBrigada
    ) {

      return;

    }


    this.usersService
      .getUnidades(

        String(
          this.formulario.idNucleo
        ),

        String(
          this.formulario.idBrigada
        )

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
            'ERROR UNIDADES QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR UNIDAD
  // AUTOCOMPLETA NÚCLEO IG + IG
  // =========================================

  cambiarUnidad(): void {

    const unidadSeleccionada =
      this.obtenerUnidadSeleccionada();


    if (
      !unidadSeleccionada
    ) {

      return;

    }


    this.formulario.idNucleoIg =
      unidadSeleccionada.idNucleo
        ? String(
            unidadSeleccionada.idNucleo
          )
        : null;


    const idIgAutomatico =
      unidadSeleccionada.idBrigada
        ? String(
            unidadSeleccionada.idBrigada
          )
        : null;


    this.formulario.idIg =
      null;


    this.igs =
      [];


    if (
      !this.formulario.idNucleoIg
    ) {

      return;

    }


    this.usersService
      .getBrigadas(
        String(
          this.formulario.idNucleoIg
        )
      )
      .subscribe({

        next: (
          data
        ) => {

          this.igs =
            data || [];


          this.formulario.idIg =
            idIgAutomatico;

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AUTOCOMPLETANDO IG QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // UNIDAD SELECCIONADA
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
          this.formulario.idUnidad
        )
    );

  }


  // =========================================
  // NOMBRE NÚCLEO IG
  // =========================================

  obtenerNombreNucleoIg(
    nucleo: Nucleo
  ): string {

    const nombre =
      nucleo?.nombre || '-';


    const unidad =
      this.obtenerUnidadSeleccionada();


    if (
      unidad &&
      String(
        unidad.idNucleo
      ) ===
      String(
        nucleo.idNucleo
      ) &&
      unidad.guarnicion
    ) {

      return (
        nombre
        +
        ' - '
        +
        String(
          unidad.guarnicion
        ).trim()
      );

    }


    return nombre;

  }


  // =========================================
  // PRECARGAR IG
  // =========================================

  cargarIgsIniciales(): void {

    const idIgActual =
      this.formulario.idIg;


    if (
      !this.formulario.idNucleoIg
    ) {

      this.igs =
        [];

      return;

    }


    this.usersService
      .getBrigadas(
        String(
          this.formulario.idNucleoIg
        )
      )
      .subscribe({

        next: (
          data
        ) => {

          this.igs =
            data || [];


          this.formulario.idIg =
            idIgActual;

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR CARGANDO IG QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // CAMBIAR NÚCLEO IG
  // =========================================

  cambiarNucleoIg(): void {

    this.formulario.idIg =
      null;


    this.igs =
      [];


    if (
      !this.formulario.idNucleoIg
    ) {

      return;

    }


    this.usersService
      .getBrigadas(
        String(
          this.formulario.idNucleoIg
        )
      )
      .subscribe({

        next: (
          data
        ) => {

          this.igs =
            data || [];

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR FILTRANDO IG QR3:',
            err
          );

        }

      });

  }


  // =========================================
  // CARGAR PDFs
  // =========================================

  cargarArchivosActuales(): void {

    if (
      !this.expediente?.idExpediente
    ) {

      this.archivosActuales =
        [];

      return;

    }


    this.cargandoArchivos =
      true;


    this.expedienteService
      .listarArchivosExpediente(
        this.expediente.idExpediente
      )
      .subscribe({

        next: (
          data
        ) => {

          this.archivosActuales =
            data || [];


          this.cargandoArchivos =
            false;

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL CARGAR PDFs QR3:',
            err
          );


          this.archivosActuales =
            [];


          this.cargandoArchivos =
            false;


          this.error =
            'No se pudieron cargar los documentos adjuntos.';

        }

      });

  }


  // =========================================
  // VER PDF
  // =========================================

  verPdf(
    archivo: any
  ): void {

    if (
      !archivo?.idArchivo
    ) {

      return;

    }


    this.expedienteService
      .verArchivo(
        archivo.idArchivo
      )
      .subscribe({

        next: (
          blob
        ) => {

          const url =
            URL.createObjectURL(
              blob
            );


          window.open(
            url,
            '_blank'
          );


          setTimeout(
            () => {

              URL.revokeObjectURL(
                url
              );

            },
            60000
          );

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL ABRIR PDF QR3:',
            err
          );


          this.error =
            'No se pudo abrir el PDF.';

        }

      });

  }


  // =========================================
  // ELIMINAR PDF
  // =========================================

  eliminarPdf(
    archivo: any
  ): void {

    if (
      !archivo?.idArchivo ||
      this.guardando ||
      this.eliminandoArchivo !== null
    ) {

      return;

    }


    Swal.fire({

      title:
        '¿Eliminar documento?',


      html:
        `
        Se eliminará el archivo
        <br><br>
        <strong>
          ${archivo.nombreArchivo}
        </strong>
        `,


      icon:
        'warning',


      showCancelButton:
        true,


      confirmButtonText:
        'SÍ, ELIMINAR',


      cancelButtonText:
        'CANCELAR',


      confirmButtonColor:
        '#176b49',


      cancelButtonColor:
        '#8f9893',


      reverseButtons:
        true,


      allowOutsideClick:
        false

    })
      .then(
        resultado => {

          if (
            !resultado.isConfirmed
          ) {

            return;

          }


          this.error =
            '';


          this.eliminandoArchivo =
            archivo.idArchivo;


          this.expedienteService
            .eliminarArchivoExpediente(
              archivo.idArchivo
            )
            .subscribe({

              next: () => {

                this.eliminandoArchivo =
                  null;


                this.cargarArchivosActuales();


                Swal.fire({

                  title:
                    'Documento eliminado',


                  text:
                    'El archivo PDF fue eliminado correctamente.',


                  icon:
                    'success',


                  confirmButtonText:
                    'OK',


                  confirmButtonColor:
                    '#176b49'

                });

              },


              error: (
                err
              ) => {

                console.error(
                  'ERROR AL ELIMINAR PDF QR3:',
                  err
                );


                this.eliminandoArchivo =
                  null;


                Swal.fire({

                  title:
                    'No se pudo eliminar',


                  text:
                    'Ocurrió un error al eliminar el documento PDF.',


                  icon:
                    'error',


                  confirmButtonText:
                    'OK',


                  confirmButtonColor:
                    '#176b49'

                });

              }

            });

        }
      );

  }


  // =========================================
  // SELECCIONAR NUEVOS PDFs
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


    const seleccionados =
      Array.from(
        input.files
      );


    const totalFinal =

      this.archivosActuales.length
      +
      this.archivosNuevos.length
      +
      seleccionados.length;


    if (
      totalFinal > 5
    ) {

      this.error =
        `Solo puede tener 5 PDFs en total. Actualmente tiene ${this.archivosActuales.length + this.archivosNuevos.length}.`;


      input.value =
        '';


      return;

    }


    const invalido =
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
      invalido
    ) {

      this.error =
        'Solo se permiten archivos PDF.';


      input.value =
        '';


      return;

    }


    const maxTamano =
      10 *
      1024 *
      1024;


    const demasiadoGrande =
      seleccionados.some(
        (
          archivo: File
        ) =>
          archivo.size >
          maxTamano
      );


    if (
      demasiadoGrande
    ) {

      this.error =
        'Cada archivo PDF debe pesar como máximo 10 MB.';


      input.value =
        '';


      return;

    }


    this.error =
      '';


    this.archivosNuevos = [

      ...this.archivosNuevos,

      ...seleccionados

    ];


    input.value =
      '';

  }


  // =========================================
  // QUITAR PDF NUEVO
  // =========================================

  quitarArchivoNuevo(
    index: number
  ): void {

    this.archivosNuevos =
      this.archivosNuevos.filter(
        (
          _archivo,
          i
        ) =>
          i !== index
      );

  }


  // =========================================
  // VALIDAR
  // =========================================

  validarFormulario(): boolean {


    if (
      !this.formulario.idTipoExpediente
    ) {

      this.error =
        'Seleccione una categoría.';

      return false;

    }


    if (
      !this.formulario.idTipoDocumento
    ) {

      this.error =
        'Seleccione el tipo de documento.';

      return false;

    }


    if (
      this.esTipoDocumentoOtros() &&
      !String(
        this.formulario.otroTipoDocumento || ''
      ).trim()
    ) {

      this.error =
        'Especifique el tipo de documento.';

      return false;

    }


    if (
      !String(
        this.formulario.nroDocumento || ''
      ).trim()
    ) {

      this.error =
        'Ingrese el número de documento.';

      return false;

    }


    if (
      !this.formulario.fechaDocumento
    ) {

      this.error =
        'Seleccione la fecha.';

      return false;

    }


    if (
      !this.formulario.idTipificacion
    ) {

      this.error =
        'Seleccione una tipificación.';

      return false;

    }


    if (
      !this.formulario.idNucleo
    ) {

      this.error =
        'Seleccione un núcleo.';

      return false;

    }


    if (
      !this.formulario.idBrigada
    ) {

      this.error =
        'Seleccione una gran unidad.';

      return false;

    }


    if (
      !this.formulario.idUnidad
    ) {

      this.error =
        'Seleccione una unidad.';

      return false;

    }


    if (
      !this.formulario.idNucleoIg
    ) {

      this.error =
        'Seleccione un Núcleo IG.';

      return false;

    }


    if (
      !this.formulario.idIg
    ) {

      this.error =
        'Seleccione una IG.';

      return false;

    }


    if (
      !String(
        this.formulario.asunto || ''
      ).trim()
    ) {

      this.error =
        'Ingrese el asunto.';

      return false;

    }


    if (
      !String(
        this.formulario.descripcion || ''
      ).trim()
    ) {

      this.error =
        'Ingrese la descripción.';

      return false;

    }


    if (
      this.archivosActuales.length +
      this.archivosNuevos.length >
      5
    ) {

      this.error =
        'El expediente solo puede tener máximo 5 archivos PDF.';

      return false;

    }


    this.error =
      '';


    return true;

  }


  // =========================================
  // GUARDAR CAMBIOS
  // =========================================

  guardarCambios(): void {

    if (
      !this.expediente?.idExpediente
    ) {

      return;

    }


    if (
      this.guardando
    ) {

      return;

    }


    if (
      !this.validarFormulario()
    ) {

      return;

    }


    const datosActualizar = {


      idTipoExpediente:
        Number(
          this.formulario.idTipoExpediente
        ),


      idTipoDocumento:
        Number(
          this.formulario.idTipoDocumento
        ),


      otroTipoDocumento:
        this.esTipoDocumentoOtros()
          ? String(
              this.formulario.otroTipoDocumento
            ).trim()
          : null,


      nroDocumento:
        String(
          this.formulario.nroDocumento
        ).trim(),


      fechaDocumento:
        this.formulario.fechaDocumento,


      idTipificacion:
        Number(
          this.formulario.idTipificacion
        ),


      idNucleo:
        String(
          this.formulario.idNucleo
        ),


      idBrigada:
        String(
          this.formulario.idBrigada
        ),


      idUnidad:
        String(
          this.formulario.idUnidad
        ),


      idNucleoIg:
        Number(
          this.formulario.idNucleoIg
        ),


      idIg:
        String(
          this.formulario.idIg
        ),


      asunto:
        String(
          this.formulario.asunto
        ).trim(),


      descripcion:
        String(
          this.formulario.descripcion
        ).trim()

    };


    Swal.fire({

      icon:
        'question',


      title:
        '¿Guardar cambios?',


      html:
        `
        Se actualizará el expediente
        <br><br>
        <strong>
          ${this.expediente.cinv}
        </strong>
        `,


      showCancelButton:
        true,


      confirmButtonText:
        'SÍ, GUARDAR',


      cancelButtonText:
        'CANCELAR',


      confirmButtonColor:
        '#176b49',


      cancelButtonColor:
        '#8f9893',


      reverseButtons:
        true

    })
      .then(
        resultado => {

          if (
            !resultado.isConfirmed
          ) {

            return;

          }


          this.actualizarExpediente(
            datosActualizar
          );

        }
      );

  }


  // =========================================
  // ACTUALIZAR
  // =========================================

  private actualizarExpediente(
    datosActualizar: any
  ): void {

    this.guardando =
      true;


    this.error =
      '';


    this.expedienteService
      .actualizarExpediente(

        this.expediente.idExpediente,

        datosActualizar

      )
      .subscribe({

        next: (
          respuesta
        ) => {

          if (
            this.archivosNuevos.length === 0
          ) {

            this.finalizarActualizacion(
              respuesta
            );

            return;

          }


          this.expedienteService
            .agregarArchivosExpediente(

              this.expediente.idExpediente,

              this.expediente.cinv,

              this.archivosNuevos

            )
            .subscribe({

              next: () => {

                this.archivosNuevos =
                  [];


                this.finalizarActualizacion(
                  respuesta
                );

              },


              error: (
                err
              ) => {

                console.error(
                  'ERROR AL AGREGAR PDFs QR3:',
                  err
                );


                this.guardando =
                  false;


                this.error =
                  'Los datos fueron actualizados, pero no se pudieron guardar los nuevos PDFs.';

              }

            });

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL ACTUALIZAR QR3:',
            err
          );


          this.guardando =
            false;


          this.error =
            'No se pudo actualizar el documento.';

        }

      });

  }


  // =========================================
  // FINALIZAR
  // =========================================

  private finalizarActualizacion(
    respuesta: any
  ): void {

    this.guardando =
      false;


    Swal.fire({

      icon:
        'success',


      title:
        'Documento actualizado',


      text:
        'Los cambios fueron guardados correctamente.',


      confirmButtonText:
        'ACEPTAR',


      confirmButtonColor:
        '#176b49'

    });


    this.actualizado.emit(
      respuesta
    );

  }


  // =========================================
  // CERRAR
  // =========================================

  cerrarModal(): void {

    if (
      this.guardando ||
      this.eliminandoArchivo !== null
    ) {

      return;

    }


    this.cerrar.emit();

  }

}