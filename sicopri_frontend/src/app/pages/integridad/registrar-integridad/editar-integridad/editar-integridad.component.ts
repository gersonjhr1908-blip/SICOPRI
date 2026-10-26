import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  OnDestroy
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import {
  IntegridadService
} from '../../../../services/integridad.service';

import {
  ExpedienteService
} from '../../../../services/expediente.service';


@Component({
  selector: 'app-editar-integridad',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './editar-integridad.component.html',

  styleUrl:
    './editar-integridad.component.css'
})
export class EditarIntegridadComponent
  implements OnChanges, OnDestroy {


  // =========================================
  // INPUT
  // =========================================

  @Input()
  denuncia: any = null;


  // =========================================
  // OUTPUT
  // =========================================

  @Output()
  cerrar =
    new EventEmitter<void>();


  @Output()
  actualizado =
    new EventEmitter<any>();


  // =========================================
  // CONTROL
  // =========================================

  cargando =
    false;

  guardando =
    false;

  error =
    '';


  // =========================================
  // DATOS
  // =========================================

  idExpediente: number | null =
    null;

  cinv =
    '';

  tipoDocumento: string | null =
    null;

  dni =
    '';

  correo =
    '';

  telefono =
    '';

  fechaActoCorrupcion =
    '';

  motivoDenuncia: string | null =
    null;

  medidaProteccion: string | null =
    null;

  identificacion: string | null =
    null;

  sexo: string | null =
    null;

  detalle =
    '';

  detalleOtros =
    '';


  // =========================================
  // PDFs
  // =========================================

  archivosActuales: any[] =
    [];

  archivosNuevos: File[] =
    [];

  cargandoArchivos =
    false;

  eliminandoArchivo:
    number | null =
    null;

  maxArchivos =
    5;

  maxTamanoArchivo =
    10 * 1024 * 1024;


  // =========================================
  // URLs TEMPORALES PDF
  // =========================================

  urlsTemporales: string[] =
    [];


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private integridadService:
      IntegridadService,

    private expedienteService:
      ExpedienteService

  ) { }


  // =========================================
  // CAMBIO DE DENUNCIA
  // =========================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['denuncia'] &&
      this.denuncia?.idExpediente
    ) {

      this.limpiarEstado();

      this.cargarDetalle();

    }

  }


  // =========================================
  // DESTRUIR
  // =========================================

  ngOnDestroy(): void {

    this.liberarUrls();

  }


  // =========================================
  // LIMPIAR ESTADO
  // =========================================

  private limpiarEstado(): void {

    this.error =
      '';

    this.archivosActuales =
      [];

    this.archivosNuevos =
      [];

    this.eliminandoArchivo =
      null;

    this.liberarUrls();

  }


  // =========================================
  // CARGAR DETALLE
  // =========================================

  cargarDetalle(): void {

    const id =
      Number(
        this.denuncia?.idExpediente
      );


    if (
      !id ||
      id <= 0
    ) {

      this.error =
        'No se pudo identificar la denuncia.';

      return;

    }


    this.cargando =
      true;


    this.error =
      '';


    this.integridadService
      .obtenerDetalle(id)
      .subscribe({


        next: (
          data: any
        ) => {


          this.cargando =
            false;


          this.idExpediente =
            Number(
              data.idExpediente
            );


          this.cinv =
            data.cinv || '';


          this.tipoDocumento =
            data.tipoDocumento || null;


          this.dni =
            data.dni || '';


          this.correo =
            data.correo || '';


          this.telefono =
            data.telefono || '';


          this.fechaActoCorrupcion =
            data.fechaActoCorrupcion || '';


          this.motivoDenuncia =
            data.motivoDenuncia || null;


          this.medidaProteccion =
            data.medidaProteccion || null;


          this.identificacion =
            data.identificacion || null;


          this.sexo =
            data.sexo || null;


          this.detalle =
            data.detalle || '';


          this.detalleOtros =
            data.detalleOtros || '';


          // =================================
          // CARGAR PDFs DEL EXPEDIENTE
          // =================================

          this.cargarArchivos();

        },


        error: (
          err: any
        ) => {


          console.error(
            'Error cargando denuncia:',
            err
          );


          this.cargando =
            false;


          this.error =
            err?.error?.message ||
            err?.error ||
            'No se pudo cargar la denuncia.';

        }

      });

  }


  // =========================================
  // CARGAR PDFs ACTUALES
  // =========================================

  cargarArchivos(): void {

    if (
      !this.idExpediente
    ) {

      return;

    }


    this.cargandoArchivos =
      true;


    this.expedienteService
      .listarArchivosExpediente(
        this.idExpediente
      )
      .subscribe({


        next: (
          data: any[]
        ) => {


          this.archivosActuales =
            data || [];


          this.cargandoArchivos =
            false;

        },


        error: (
          err: any
        ) => {


          console.error(
            'Error cargando PDFs:',
            err
          );


          this.archivosActuales =
            [];


          this.cargandoArchivos =
            false;

        }

      });

  }


  // =========================================
  // VER PDF
  // =========================================

  verPdf(
    archivo: any
  ): void {

    const idArchivo =
      Number(
        archivo?.idArchivo
      );


    if (
      !idArchivo ||
      idArchivo <= 0
    ) {

      return;

    }


    this.expedienteService
      .verArchivo(
        idArchivo
      )
      .subscribe({


        next: (
          blob: Blob
        ) => {


          const url =
            URL.createObjectURL(
              blob
            );


          this.urlsTemporales.push(
            url
          );


          window.open(
            url,
            '_blank'
          );

        },


        error: (
          err: any
        ) => {


          console.error(
            'Error abriendo PDF:',
            err
          );


          Swal.fire({

            icon:
              'error',

            title:
              'Error',

            text:
              'No se pudo abrir el documento PDF.'

          });

        }

      });

  }


  // =========================================
  // ELIMINAR PDF ACTUAL
  // =========================================

  eliminarPdf(
    archivo: any
  ): void {

    const idArchivo =
      Number(
        archivo?.idArchivo
      );


    if (
      !idArchivo ||
      idArchivo <= 0
    ) {

      return;

    }


    Swal.fire({

      icon:
        'warning',

      title:
        '¿Eliminar PDF?',

      html:
        `Se quitará <b>${archivo?.nombreArchivo || 'el documento'}</b> del expediente.`,

      showCancelButton:
        true,

      confirmButtonText:
        'Sí, eliminar',

      cancelButtonText:
        'Cancelar',

      confirmButtonColor:
        '#b42318'

    })
      .then(
        resultado => {


          if (
            !resultado.isConfirmed
          ) {

            return;

          }


          this.eliminandoArchivo =
            idArchivo;


          this.expedienteService
            .eliminarArchivoExpediente(
              idArchivo
            )
            .subscribe({


              next: () => {


                this.eliminandoArchivo =
                  null;


                this.archivosActuales =
                  this.archivosActuales.filter(
                    (
                      item: any
                    ) =>
                      Number(
                        item.idArchivo
                      ) !== idArchivo
                  );


                Swal.fire({

                  icon:
                    'success',

                  title:
                    'Documento eliminado',

                  text:
                    'El PDF fue eliminado correctamente.',

                  timer:
                    1300,

                  showConfirmButton:
                    false

                });

              },


              error: (
                err: any
              ) => {


                console.error(
                  'Error eliminando PDF:',
                  err
                );


                this.eliminandoArchivo =
                  null;


                Swal.fire({

                  icon:
                    'error',

                  title:
                    'Error',

                  text:
                    'No se pudo eliminar el PDF.'

                });

              }

            });

        }
      );

  }


  // =========================================
  // SELECCIONAR NUEVOS PDF
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


    // =======================================
    // VALIDAR SOLO PDF
    // =======================================

    for (
      const archivo of seleccionados
    ) {


      const nombre =
        archivo.name
          .toLowerCase();


      const esPdf =
        archivo.type ===
          'application/pdf'
        ||
        nombre.endsWith(
          '.pdf'
        );


      if (
        !esPdf
      ) {

        Swal.fire({

          icon:
            'warning',

          title:
            'Archivo no permitido',

          text:
            'Solo se permiten archivos PDF.'

        });


        input.value =
          '';

        return;

      }


      if (
        archivo.size >
        this.maxTamanoArchivo
      ) {

        Swal.fire({

          icon:
            'warning',

          title:
            'Archivo demasiado grande',

          text:
            `${archivo.name} supera el límite de 10 MB.`

        });


        input.value =
          '';

        return;

      }

    }


    // =======================================
    // VALIDAR MÁXIMO 5
    // =======================================

    const totalFinal =

      this.archivosActuales.length
      +
      this.archivosNuevos.length
      +
      seleccionados.length;


    if (
      totalFinal >
      this.maxArchivos
    ) {

      Swal.fire({

        icon:
          'warning',

        title:
          'Límite de archivos',

        text:
          'Solo se permiten máximo 5 archivos PDF en total.'

      });


      input.value =
        '';

      return;

    }


    // =======================================
    // EVITAR REPETIDOS
    // =======================================

    const nuevosSinRepetir =
      seleccionados.filter(
        (
          nuevo: File
        ) => {


          const yaNuevo =
            this.archivosNuevos.some(
              (
                existente: File
              ) =>
                existente.name ===
                  nuevo.name
                &&
                existente.size ===
                  nuevo.size
            );


          const yaActual =
            this.archivosActuales.some(
              (
                existente: any
              ) =>
                String(
                  existente.nombreArchivo ||
                  ''
                )
                  .toLowerCase()
                ===
                nuevo.name
                  .toLowerCase()
            );


          return (
            !yaNuevo &&
            !yaActual
          );

        }
      );


    this.archivosNuevos = [

      ...this.archivosNuevos,

      ...nuevosSinRepetir

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

    if (
      index < 0 ||
      index >=
        this.archivosNuevos.length
    ) {

      return;

    }


    this.archivosNuevos.splice(
      index,
      1
    );


    this.archivosNuevos = [
      ...this.archivosNuevos
    ];

  }


  // =========================================
  // TAMAÑO ARCHIVO
  // =========================================

  obtenerTamanoArchivo(
    bytes: number
  ): string {

    if (
      !bytes
    ) {

      return '0 KB';

    }


    const mb =
      bytes /
      (
        1024 *
        1024
      );


    if (
      mb >= 1
    ) {

      return `${mb.toFixed(2)} MB`;

    }


    const kb =
      bytes /
      1024;


    return `${kb.toFixed(0)} KB`;

  }


  // =========================================
  // GUARDAR CAMBIOS
  // =========================================

  guardarCambios(): void {


    if (
      !this.idExpediente
    ) {

      return;

    }


    if (
      !this.fechaActoCorrupcion
    ) {

      Swal.fire({

        icon:
          'warning',

        title:
          'Dato requerido',

        text:
          'Ingrese la fecha del acto de corrupción.'

      });

      return;

    }


    if (
      !this.motivoDenuncia
    ) {

      Swal.fire({

        icon:
          'warning',

        title:
          'Dato requerido',

        text:
          'Seleccione el motivo de la denuncia.'

      });

      return;

    }


    if (
      this.guardando
    ) {

      return;

    }


    const datos = {

      // Ya no usamos código
      nroDocumento:
        '',

      tipoDocumento:
        this.tipoDocumento,

      dni:
        this.dni,

      correo:
        this.correo,

      telefono:
        this.telefono,

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
        this.detalle,

      detalleOtros:
        this.detalleOtros

    };


    Swal.fire({

      icon:
        'question',

      title:
        '¿Guardar cambios?',

      html:
        `
        Se actualizará la denuncia
        <b>${this.cinv}</b>.

        ${
          this.archivosNuevos.length > 0
            ? `<br><br>Se agregarán ${this.archivosNuevos.length} PDF nuevo(s).`
            : ''
        }
        `,

      showCancelButton:
        true,

      confirmButtonText:
        'Sí, guardar',

      cancelButtonText:
        'Cancelar',

      confirmButtonColor:
        '#315f27'

    })
      .then(
        resultado => {


          if (
            !resultado.isConfirmed
          ) {

            return;

          }


          this.actualizar(
            datos
          );

        }
      );

  }


  // =========================================
  // ACTUALIZAR DATOS
  // =========================================

  private actualizar(
    datos: any
  ): void {


    if (
      !this.idExpediente
    ) {

      return;

    }


    this.guardando =
      true;


    this.integridadService
      .actualizarDenuncia(

        this.idExpediente,

        datos

      )
      .subscribe({


        next: (
          respuesta: any
        ) => {


          // ===================================
          // SI HAY PDF NUEVOS
          // LOS GUARDAMOS DESPUÉS
          // ===================================

          if (
            this.archivosNuevos.length > 0
          ) {


            this.guardarArchivosNuevos(
              respuesta
            );


            return;

          }


          this.finalizarActualizacion(
            respuesta
          );

        },


        error: (
          err: any
        ) => {


          console.error(
            'Error actualizando denuncia:',
            err
          );


          this.guardando =
            false;


          Swal.fire({

            icon:
              'error',

            title:
              'Error',

            text:
              err?.error?.message ||
              err?.error ||
              'No se pudo actualizar la denuncia.'

          });

        }

      });

  }


  // =========================================
  // GUARDAR PDFs NUEVOS
  // =========================================

  private guardarArchivosNuevos(
    respuesta: any
  ): void {


    if (
      !this.idExpediente
    ) {

      return;

    }


    this.expedienteService
      .agregarArchivosExpediente(

        this.idExpediente,

        this.cinv,

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
          err: any
        ) => {


          console.error(
            'Datos guardados pero error agregando PDFs:',
            err
          );


          this.guardando =
            false;


          Swal.fire({

            icon:
              'warning',

            title:
              'Datos actualizados',

            text:
              'Los datos se actualizaron, pero ocurrió un error al guardar los nuevos PDFs.'

          });

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
        'Actualizado',

      text:
        'La denuncia fue actualizada correctamente.',

      confirmButtonText:
        'Aceptar',

      confirmButtonColor:
        '#315f27'

    });


    this.actualizado.emit(
      respuesta
    );

  }


  // =========================================
  // CERRAR
  // =========================================

  salir(): void {

    if (
      this.guardando ||
      this.eliminandoArchivo !== null
    ) {

      return;

    }


    this.liberarUrls();


    this.cerrar.emit();

  }


  // =========================================
  // LIBERAR URLS BLOB
  // =========================================

  private liberarUrls(): void {

    this.urlsTemporales
      .forEach(
        (
          url: string
        ) => {

          URL.revokeObjectURL(
            url
          );

        }
      );


    this.urlsTemporales =
      [];

  }

}