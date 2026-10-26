import { CommonModule } from '@angular/common';

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
  FormsModule
} from '@angular/forms';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import {
  ExpedienteService
} from '../../../../services/expediente.service';

import {
  UsersService,
  Nucleo,
  Brigada,
  Unidad
} from '../../../../services/users.service';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-ver-caso-listado-qrd3',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './ver-caso-listado-qrd3.component.html',

  styleUrl:
    './ver-caso-listado-qrd3.component.css'
})
export class VerCasoListadoQrd3Component
  implements OnChanges, OnDestroy {


  // =========================================
  // EXPEDIENTE
  // =========================================

  @Input()
  expediente: any =
    null;

  // Desde Listado Total todo el contenido es consulta.
  @Input()
  soloLectura: boolean = true;


  // =========================================
  // OUTPUTS
  // =========================================

  @Output()
  cerrar =
    new EventEmitter<void>();


  /*
   * IMPORTANTE:
   *
   * Este evento NO actualiza todavía
   * NIVEL_ACTUAL directamente.
   *
   * El padre recibirá el expediente y
   * después conectaremos el endpoint
   * backend QRD3 -> QRD3 con trazabilidad.
   */
  @Output()
  enviarQr3 =
    new EventEmitter<any>();


  // =========================================
  // PESTAÑAS
  //
  // 1 = DOCUMENTO
  // 2 = PDF
  // 3 = SEGUIMIENTO (SOLO LECTURA)
  // =========================================

  pestanaActiva:
    number = 1;


  // =========================================
  // DATOS VISUALES
  // =========================================

  nombreTipoDocumento:
    string = '';

  nombreTipificacion:
    string = '';


  // =========================================
  // UBICACIÓN
  // =========================================

  nombreNucleo:
    string = '';

  nombreBrigada:
    string = '';

  nombreUnidad:
    string = '';

  guarnicionUnidad:
    string = '';


  // =========================================
  // INSPECTORÍA
  // =========================================

  nombreNucleoIg:
    string = '';

  nombreIg:
    string = '';


  // =========================================
  // OBSERVACIÓN ACTUAL
  // =========================================

  observacionActual:
    string = '';


  guardandoObservacion:
    boolean = false;


  observacionGuardada:
    boolean = false;


  errorObservacion:
    string = '';


  private temporizadorObservacion:
    any = null;


  // =========================================
  // SEGUIMIENTO RECIBIDO DE QRD2
  // SOLO LECTURA EN QRD3
  // =========================================

  seguimientoRegistrado:
    boolean = false;

  cargandoSeguimiento:
    boolean = false;

  errorSeguimiento:
    string = '';

  fechaInicioSeguimiento:
    string = '';

  fechaFinSeguimiento:
    string = '';

  cantidadDiasSeguimiento:
    number = 0;


  // =========================================
  // PDFs
  // =========================================

  archivos:
    any[] = [];


  archivoSeleccionado:
    any = null;


  pdfUrl:
    SafeResourceUrl | null =
    null;


  private objectUrlActual:
    string | null =
    null;


  cargandoArchivos:
    boolean = false;


  cargandoPdf:
    boolean = false;


  archivosCargados:
    boolean = false;


  errorArchivos:
    string = '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private expedienteService:
      ExpedienteService,

    private usersService:
      UsersService,

    private sanitizer:
      DomSanitizer

  ) {}


  // =========================================
  // CAMBIO EXPEDIENTE
  // =========================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['expediente'] &&
      this.expediente
    ) {

      this.inicializarCaso();

    }

  }


  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {

    this.limpiarPdf();


    if (
      this.temporizadorObservacion
    ) {

      clearTimeout(
        this.temporizadorObservacion
      );

    }

  }


  // =========================================
  // INICIALIZAR
  // =========================================

  inicializarCaso(): void {

    this.pestanaActiva =
      1;


    this.nombreTipoDocumento =
      '';


    this.nombreTipificacion =
      '';


    this.nombreNucleo =
      '';


    this.nombreBrigada =
      '';


    this.nombreUnidad =
      '';


    this.guarnicionUnidad =
      '';


    this.nombreNucleoIg =
      '';


    this.nombreIg =
      '';


    // =======================================
    // OBSERVACIÓN
    // =======================================

    this.observacionActual =
      String(
        this.expediente
          ?.observacionActual || ''
      );


    this.guardandoObservacion =
      false;


    this.observacionGuardada =
      false;


    this.errorObservacion =
      '';


    // =======================================
    // SEGUIMIENTO RECIBIDO DE QRD2
    // =======================================

    this.seguimientoRegistrado = false;
    this.cargandoSeguimiento = false;
    this.errorSeguimiento = '';
    this.fechaInicioSeguimiento = '';
    this.fechaFinSeguimiento = '';
    this.cantidadDiasSeguimiento = 0;


    // =======================================
    // PDFs
    // =======================================

    this.archivos =
      [];


    this.archivoSeleccionado =
      null;


    this.archivosCargados =
      false;


    this.cargandoArchivos =
      false;


    this.cargandoPdf =
      false;


    this.errorArchivos =
      '';


    this.limpiarPdf();


    // =======================================
    // CATÁLOGOS
    // =======================================

    this.cargarTipoDocumento();

    this.cargarTipificacion();

    this.cargarNombresUbicacion();

    this.cargarNombresInspectoria();

    if (this.esExpedienteRecibidoDeQrd2()) {
      this.cargarSeguimiento();
    }

  }


  // =========================================
  // CARGAR SEGUIMIENTO - SOLO LECTURA
  // =========================================

  cargarSeguimiento(): void {

    if (!this.esExpedienteRecibidoDeQrd2()) {
      return;
    }

    const idExpediente =
      Number(this.expediente?.idExpediente);

    if (!idExpediente) {
      return;
    }

    this.cargandoSeguimiento = true;
    this.errorSeguimiento = '';

    this.expedienteService
      .obtenerSeguimiento(idExpediente)
      .subscribe({

        next: (respuesta: any) => {

          this.cargandoSeguimiento = false;

          const seguimiento =
            respuesta?.seguimiento ?? respuesta;

          if (
            !seguimiento ||
            (
              !seguimiento?.fechaInicio &&
              !seguimiento?.fechaFin
            )
          ) {
            return;
          }

          this.fechaInicioSeguimiento =
            this.normalizarFecha(seguimiento.fechaInicio);

          this.fechaFinSeguimiento =
            this.normalizarFecha(seguimiento.fechaFin);

          const dias =
            Number(seguimiento.cantidadDias);

          this.cantidadDiasSeguimiento =
            Number.isFinite(dias) ? dias : 0;

          this.seguimientoRegistrado = true;

        },

        error: (err: any) => {

          this.cargandoSeguimiento = false;

          // 404 significa que QRD2 aún no registró seguimiento.
          if (err?.status === 404 || err?.status === 204) {
            return;
          }

          console.error(
            'ERROR AL CARGAR SEGUIMIENTO QRD3:',
            err
          );

          this.errorSeguimiento =
            'No se pudo cargar el seguimiento del expediente.';

        }

      });

  }


  private normalizarFecha(
    fecha: any
  ): string {

    if (!fecha) {
      return '';
    }

    return String(fecha).substring(0, 10);

  }


  // Se muestra cuando QRD2 ya procesó el expediente y lo
  // derivó a QRD3. El destino final para este nivel es Nivel 4.
  esExpedienteRecibidoDeQrd2(): boolean {

    const nivelDestino = Number(this.expediente?.nivelDestino);

    return Number(this.expediente?.nivelActual) === 4 &&
      nivelDestino === 4;

  }


  obtenerDestinoFinal(): string {

    const nivelDestino = Number(this.expediente?.nivelDestino);

    if (nivelDestino === 3) {
      return 'Inspectoría QRD - Nivel 3';
    }

    if (nivelDestino === 4) {
      return 'Inspectoría QRD - Nivel 4';
    }

    return '-';

  }


  // =========================================
  // CATEGORÍA
  // =========================================

  obtenerCategoriaQrd(): string {

    const tipo =
      Number(
        this.expediente
          ?.idTipoExpediente
      );


    switch (
      tipo
    ) {

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

    if (
      !this.expediente
    ) {

      return;

    }


    const idTipoDocumento =
      Number(
        this.expediente
          .idTipoDocumento
      );


    if (
      this.expediente.documento
    ) {

      this.nombreTipoDocumento =
        String(
          this.expediente.documento
        );

    }


    this.expedienteService
      .getTiposDocumento()
      .subscribe({

        next: (
          data: any[]
        ) => {

          const encontrado =
            (data || []).find(
              (
                tipo: any
              ) =>
                Number(
                  tipo.idTipoDocumento
                ) ===
                idTipoDocumento
            );


          if (
            encontrado
          ) {

            const nombre =
              String(
                encontrado.nombre || ''
              ).trim();


            if (
              nombre
                .toUpperCase() ===
                'OTROS'
              &&
              this.expediente
                .otroTipoDocumento
            ) {

              this.nombreTipoDocumento =
                this.expediente
                  .otroTipoDocumento;

            } else {

              this.nombreTipoDocumento =
                nombre;

            }

          }


          if (
            !this.nombreTipoDocumento
          ) {

            this.nombreTipoDocumento =
              '-';

          }

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR TIPO DOCUMENTO QR4:',
            err
          );


          this.nombreTipoDocumento =
            this.expediente
              ?.otroTipoDocumento
            ||
            this.expediente
              ?.documento
            ||
            '-';

        }

      });

  }


  // =========================================
  // TIPIFICACIÓN
  // =========================================

  cargarTipificacion(): void {

    if (
      !this.expediente
    ) {

      return;

    }


    const idTipoExpediente =
      Number(
        this.expediente
          .idTipoExpediente
      );


    const idTipificacion =
      Number(
        this.expediente
          .idTipificacion
      );


    if (
      !idTipoExpediente ||
      !idTipificacion
    ) {

      this.nombreTipificacion =
        '-';

      return;

    }


    this.expedienteService
      .getTipificaciones(
        idTipoExpediente
      )
      .subscribe({

        next: (
          data: any[]
        ) => {

          const encontrado =
            (data || []).find(
              (
                item: any
              ) =>
                Number(
                  item.idTipificacion
                ) ===
                idTipificacion
            );


          this.nombreTipificacion =
            encontrado?.nombre
            ||
            String(
              idTipificacion
            );

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR TIPIFICACIÓN QR4:',
            err
          );


          this.nombreTipificacion =
            String(
              idTipificacion
            );

        }

      });

  }


  // =========================================
  // UBICACIÓN NORMAL
  // =========================================

  cargarNombresUbicacion(): void {

    if (
      !this.expediente
    ) {

      return;

    }


    const idNucleo =
      this.expediente.idNucleo;


    const idBrigada =
      this.expediente.idBrigada;


    const idUnidad =
      this.expediente.idUnidad;


    // =======================================
    // NÚCLEO
    // =======================================

    if (
      idNucleo
    ) {

      this.usersService
        .getNucleos()
        .subscribe({

          next: (
            data: Nucleo[]
          ) => {

            const nucleo =
              (data || []).find(
                (
                  item: Nucleo
                ) =>
                  String(
                    item.idNucleo
                  ) ===
                  String(
                    idNucleo
                  )
              );


            this.nombreNucleo =
              nucleo?.nombre
              ||
              String(
                idNucleo
              );

          },


          error: (
            err
          ) => {

            console.error(
              'ERROR NÚCLEO QR4:',
              err
            );


            this.nombreNucleo =
              String(
                idNucleo
              );

          }

        });

    }


    // =======================================
    // GRAN UNIDAD
    // =======================================

    if (
      idNucleo &&
      idBrigada
    ) {

      this.usersService
        .getBrigadas(
          String(
            idNucleo
          )
        )
        .subscribe({

          next: (
            data: Brigada[]
          ) => {

            const brigada =
              (data || []).find(
                (
                  item: Brigada
                ) =>
                  String(
                    item.idBrigada
                  ) ===
                  String(
                    idBrigada
                  )
              );


            this.nombreBrigada =
              brigada?.nombre
              ||
              String(
                idBrigada
              );

          },


          error: (
            err
          ) => {

            console.error(
              'ERROR GRAN UNIDAD QR4:',
              err
            );


            this.nombreBrigada =
              String(
                idBrigada
              );

          }

        });

    }


    // =======================================
    // UNIDAD
    // =======================================

    if (
      idNucleo &&
      idBrigada &&
      idUnidad
    ) {

      this.usersService
        .getUnidades(

          String(
            idNucleo
          ),

          String(
            idBrigada
          )

        )
        .subscribe({

          next: (
            data: Unidad[]
          ) => {

            const unidad =
              (data || []).find(
                (
                  item: Unidad
                ) =>
                  String(
                    item.idUnidad
                  ) ===
                  String(
                    idUnidad
                  )
              );


            this.nombreUnidad =
              unidad?.nombre
              ||
              String(
                idUnidad
              );


            this.guarnicionUnidad =
              String(
                unidad?.guarnicion || ''
              ).trim();


            this.actualizarNombreNucleoIg();

          },


          error: (
            err
          ) => {

            console.error(
              'ERROR UNIDAD QR4:',
              err
            );


            this.nombreUnidad =
              String(
                idUnidad
              );

          }

        });

    }

  }


  // =========================================
  // INSPECTORÍA
  // =========================================

  cargarNombresInspectoria(): void {

    if (
      !this.expediente
    ) {

      return;

    }


    const idNucleoIg =
      this.expediente.idNucleoIg;


    const idIg =
      this.expediente.idIg;


    // =======================================
    // NÚCLEO IG
    // =======================================

    if (
      idNucleoIg
    ) {

      this.usersService
        .getNucleos()
        .subscribe({

          next: (
            data: Nucleo[]
          ) => {

            const nucleo =
              (data || []).find(
                (
                  item: Nucleo
                ) =>
                  String(
                    item.idNucleo
                  ) ===
                  String(
                    idNucleoIg
                  )
              );


            this.nombreNucleoIg =
              nucleo?.nombre
              ||
              String(
                idNucleoIg
              );


            this.actualizarNombreNucleoIg();

          },


          error: (
            err
          ) => {

            console.error(
              'ERROR NÚCLEO IG QR4:',
              err
            );


            this.nombreNucleoIg =
              String(
                idNucleoIg
              );

          }

        });

    }


    // =======================================
    // IG
    // =======================================

    if (
      idNucleoIg &&
      idIg
    ) {

      this.usersService
        .getBrigadas(
          String(
            idNucleoIg
          )
        )
        .subscribe({

          next: (
            data: Brigada[]
          ) => {

            const ig =
              (data || []).find(
                (
                  item: Brigada
                ) =>
                  String(
                    item.idBrigada
                  ) ===
                  String(
                    idIg
                  )
              );


            this.nombreIg =
              ig?.nombre
              ||
              String(
                idIg
              );

          },


          error: (
            err
          ) => {

            console.error(
              'ERROR IG QR4:',
              err
            );


            this.nombreIg =
              String(
                idIg
              );

          }

        });

    }

  }


  // =========================================
  // NOMBRE VISUAL NÚCLEO IG
  // =========================================

  actualizarNombreNucleoIg(): void {

    if (
      !this.nombreNucleoIg
    ) {

      return;

    }


    const base =
      this.nombreNucleoIg
        .split(
          ' - '
        )[0]
        .trim();


    if (
      this.guarnicionUnidad
    ) {

      this.nombreNucleoIg =
        `${base} - ${this.guarnicionUnidad}`;

    } else {

      this.nombreNucleoIg =
        base;

    }

  }


  // =========================================
  // FECHA
  // =========================================

  obtenerFechaDocumento(): string {

    const fecha =
      this.expediente
        ?.fechaDocumento;


    if (
      !fecha
    ) {

      return '-';

    }


    if (
      /^\d{4}-\d{2}-\d{2}/
        .test(
          String(
            fecha
          )
        )
    ) {

      const partes =
        String(
          fecha
        )
          .substring(
            0,
            10
          )
          .split('-');


      return (
        partes[2]
        +
        '/'
        +
        partes[1]
        +
        '/'
        +
        partes[0]
      );

    }


    return String(
      fecha
    );

  }


  // =========================================
  // OBSERVACIÓN
  // AUTOGUARDADO
  // =========================================

  cambioObservacion(): void {

    if (this.soloLectura) {
      return;
    }

    this.observacionGuardada =
      false;


    this.errorObservacion =
      '';


    if (
      this.temporizadorObservacion
    ) {

      clearTimeout(
        this.temporizadorObservacion
      );

    }


    this.temporizadorObservacion =
      setTimeout(
        () => {

          this.guardarObservacion();

        },
        900
      );

  }


  // =========================================
  // GUARDAR OBSERVACIÓN
  // =========================================

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

  const observacion =
    String(this.observacionActual || '');

  this.expedienteService
    .actualizarObservacion(
      this.expediente.idExpediente,
      observacion
    )
    .subscribe({

      next: (respuesta: any) => {

        this.guardandoObservacion = false;
        this.observacionGuardada = true;

        this.expediente.observacionActual =
          respuesta?.observacionActual ?? observacion;

        console.log(
          'OBSERVACIÓN QRD3 GUARDADA:',
          respuesta
        );

        setTimeout(() => {
          this.observacionGuardada = false;
        }, 2200);

      },

      error: (err) => {

        console.error(
          'ERROR GUARDANDO OBSERVACIÓN QRD3:',
          err
        );

        this.guardandoObservacion = false;
        this.observacionGuardada = false;

        this.errorObservacion =
          'No se pudo guardar la observación.';

      }

    });

}


  // =========================================
  // SOLICITAR ENVÍO A INSPECTORÍA QRD NIVEL 3
  // =========================================

  solicitarEnvioQr3(): void {

    if (
      !this.expediente
        ?.idExpediente
    ) {

      return;

    }


    if (
      this.guardandoObservacion
    ) {

      return;

    }


    Swal.fire({

      title:
        '¿Enviar a Inspectoría QRD Nivel 3?',


      html:
        `
        <div style="
          color:#626d68;
          font-size:13px;
        ">

          El expediente

          <br><br>

          <strong style="
            color:#176b49;
            font-size:14px;
          ">
            ${this.expediente.cinv}
          </strong>

          <br><br>

          será enviado a
          <strong>Inspectoría QRD Nivel 3</strong>
          como nivel puente para su envío a QRD Nivel 2.

          <br><br>

          <span style="
            font-size:12px;
            color:#7a8580;
          ">
            Dejará de aparecer en
            Registro QRD Nivel 3.
          </span>

        </div>
        `,


      icon:
        'question',


      showCancelButton:
        true,


      confirmButtonText:
        'SÍ, ENVIAR',


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


          /*
           * Pasamos la observación actual
           * junto con el expediente.
           *
           * El siguiente paso será conectar
           * esto al endpoint backend que:
           *
           * 1. cambia NIVEL_ACTUAL 3 -> 2
           * 2. pone ID_ESTADO = 2
           * 3. conserva NIVEL_CREACION = 3
           * 4. conserva NIVEL_DESTINO = NULL
           * 5. crea EXP_EXPEDIENTE_MOVIMIENTO
           */

          const expedienteEnviar = {

            ...this.expediente,

            observacionActual:
              this.observacionActual

          };


          this.enviarQr3.emit(
            expedienteEnviar
          );

        }
      );

  }


  // =========================================
  // CAMBIAR PESTAÑA
  // =========================================

  cambiarPestana(
    numero: number
  ): void {

    this.pestanaActiva =
      numero;


    if (
      numero === 2 &&
      !this.archivosCargados
    ) {

      this.cargarArchivos();

    }

  }


  // =========================================
  // CARGAR ARCHIVOS
  // =========================================

  cargarArchivos(): void {

    if (
      !this.expediente ||
      !this.expediente.idExpediente
    ) {

      this.errorArchivos =
        'No se encontró el ID del expediente.';

      return;

    }


    this.cargandoArchivos =
      true;


    this.errorArchivos =
      '';


    this.archivos =
      [];


    this.archivoSeleccionado =
      null;


    this.limpiarPdf();


    this.expedienteService
      .listarArchivosExpediente(
        this.expediente.idExpediente
      )
      .subscribe({

        next: (
          respuesta: any[]
        ) => {

          this.archivos =
            respuesta || [];


          this.archivosCargados =
            true;


          this.cargandoArchivos =
            false;


          if (
            this.archivos.length > 0
          ) {

            this.seleccionarArchivo(
              this.archivos[0]
            );

          }

        },


        error: (
          error
        ) => {

          console.error(
            'ERROR ARCHIVOS QR4:',
            error
          );


          this.cargandoArchivos =
            false;


          this.archivosCargados =
            false;


          this.errorArchivos =
            'No se pudieron cargar los documentos adjuntos.';

        }

      });

  }


  // =========================================
  // SELECCIONAR PDF
  // =========================================

  seleccionarArchivo(
    archivo: any
  ): void {

    if (
      !archivo ||
      !archivo.idArchivo
    ) {

      return;

    }


    this.archivoSeleccionado =
      archivo;


    this.limpiarPdf();


    this.cargandoPdf =
      true;


    this.errorArchivos =
      '';


    this.expedienteService
      .verArchivo(
        archivo.idArchivo
      )
      .subscribe({

        next: (
          blob: Blob
        ) => {

          const pdfBlob =
            new Blob(
              [blob],
              {
                type:
                  'application/pdf'
              }
            );


          this.objectUrlActual =
            URL.createObjectURL(
              pdfBlob
            );


          this.pdfUrl =
            this.sanitizer
              .bypassSecurityTrustResourceUrl(
                this.objectUrlActual
              );


          this.cargandoPdf =
            false;

        },


        error: (
          error
        ) => {

          console.error(
            'ERROR PDF QR4:',
            error
          );


          this.cargandoPdf =
            false;


          this.pdfUrl =
            null;


          this.errorArchivos =
            'No se pudo visualizar el documento PDF.';

        }

      });

  }


  // =========================================
  // LIMPIAR PDF
  // =========================================

  private limpiarPdf(): void {

    if (
      this.objectUrlActual
    ) {

      URL.revokeObjectURL(
        this.objectUrlActual
      );


      this.objectUrlActual =
        null;

    }


    this.pdfUrl =
      null;

  }


  // =========================================
  // CERRAR
  // =========================================

  cerrarModal(): void {

    this.limpiarPdf();


    if (
      this.temporizadorObservacion
    ) {

      clearTimeout(
        this.temporizadorObservacion
      );

    }


    this.archivos =
      [];


    this.archivoSeleccionado =
      null;


    this.archivosCargados =
      false;


    this.cargandoArchivos =
      false;


    this.cargandoPdf =
      false;


    this.errorArchivos =
      '';


    this.pestanaActiva =
      1;


    this.cerrar.emit();

  }

}
