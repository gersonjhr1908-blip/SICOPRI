import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  NuevoDocumentoQrd3Component
} from './nuevo-documento-qrd3/nuevo-documento-qrd3.component';

import {
  VerCasoQrd3Component
} from './ver-caso-qrd3/ver-caso-qrd3.component';

import {
  EditarDocumentoQrd3Component
} from './editar-documento-qrd3/editar-documento-qrd3.component';

import {
  ExpedienteService
} from '../../../services/expediente.service';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-registro-qrd3',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    NuevoDocumentoQrd3Component,
    VerCasoQrd3Component,
    EditarDocumentoQrd3Component
  ],

  templateUrl: './registro-qrd3.component.html',

  styleUrl: './registro-qrd3.component.css'
})
export class RegistroQrd3Component implements OnInit {


  // =========================================
  // BUSCADOR
  // =========================================

  search: string = '';


  // =========================================
  // DOCUMENTOS
  // =========================================

  documentos: any[] = [];

  documentosOriginales: any[] = [];


  // =========================================
  // CATÁLOGO TIPO DOCUMENTO
  // =========================================

  tiposDocumento: any[] = [];


  // =========================================
  // MODAL NUEVO
  // =========================================

  mostrarModalNuevo:
    boolean = false;


  // =========================================
  // MODAL VER CASO
  // =========================================

  mostrarVerCaso:
    boolean = false;

  documentoSeleccionado:
    any = null;


  // =========================================
  // MODAL EDITAR
  // =========================================

  mostrarEditar:
    boolean = false;

  documentoEditar:
    any = null;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private expedienteService:
      ExpedienteService
  ) {}


  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.cargarCatalogos();

  }


  // =========================================
  // CATÁLOGOS
  // =========================================

  cargarCatalogos(): void {

    this.expedienteService
      .getTiposDocumento()
      .subscribe({

        next: (
          data
        ) => {

          this.tiposDocumento =
            data || [];


          this.cargarDocumentos();

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
  // CARGAR DOCUMENTOS REGISTRADOS QRD3
  //
  // ACTIVO = S
  // ESTADO = 1
  // NIVEL ACTUAL = 3
  // NIVEL CREACION = 3
  // QRD = DENUNCIA / QUEJA / RECLAMO
  // NO INTEGRIDAD
  // =========================================

  cargarDocumentos(): void {

    this.expedienteService
      .listarExpedientes()
      .subscribe({

        next: (
          data
        ) => {

          const expedientes =
            data || [];


          console.log(
            'EXPEDIENTES RECIBIDOS QR3:',
            expedientes
          );


          const qrdNivel3 =
            expedientes.filter(
              (
                exp: any
              ) => {


                const activo =
                  String(
                    exp.activo || ''
                  )
                    .trim()
                    .toUpperCase();


                const categoriaSistema =
                  String(
                    exp.categoria || ''
                  )
                    .trim()
                    .toUpperCase();


                const tipo =
                  Number(
                    exp.idTipoExpediente
                  );


                const nivelActual =
                  Number(
                    exp.nivelActual
                  );


                const nivelCreacion =
                  Number(
                    exp.nivelCreacion
                  );


                const estado =
                  Number(
                    exp.idEstado
                  );


                return (

                  activo === 'S'

                  &&

                  estado === 1

                  &&

                  nivelActual === 3

                  &&

                  nivelCreacion === 3

                  &&

                  categoriaSistema !==
                    'INTEGRIDAD'

                  &&

                  [1, 2, 3].includes(
                    tipo
                  )

                );

              }
            );


          // =====================================
          // ARMAR DATOS PARA TABLA
          // =====================================

          this.documentosOriginales =
            qrdNivel3.map(
              (
                exp: any
              ) => {

                return {

                  ...exp,


                  categoriaQrd:
                    this.obtenerCategoriaQrd(
                      exp.idTipoExpediente
                    ),


                  documento:
                    this.obtenerTipoDocumento(
                      exp
                    ),


                  estado:
                    'REGISTRADO'

                };

              }
            );


          this.documentos = [
            ...this.documentosOriginales
          ];


          console.log(
            'REGISTRADOS QR3:',
            this.documentos
          );

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL LISTAR QR3:',
            err
          );


          this.documentos =
            [];


          this.documentosOriginales =
            [];

        }

      });

  }


  // =========================================
  // CATEGORÍA QRD
  // =========================================

  obtenerCategoriaQrd(
    idTipoExpediente: number
  ): string {

    switch (
      Number(
        idTipoExpediente
      )
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

  obtenerTipoDocumento(
    expediente: any
  ): string {

    if (
      !expediente
    ) {

      return '-';

    }


    const encontrado =
      this.tiposDocumento.find(
        (
          tipo: any
        ) =>

          Number(
            tipo.idTipoDocumento
          ) ===

          Number(
            expediente.idTipoDocumento
          )
      );


    if (
      !encontrado
    ) {

      return '-';

    }


    const nombre =
      String(
        encontrado.nombre || ''
      ).trim();


    if (
      nombre.toUpperCase() ===
        'OTROS'
      &&
      expediente.otroTipoDocumento
    ) {

      return String(
        expediente.otroTipoDocumento
      );

    }


    return nombre;

  }


  // =========================================
  // NUEVO DOCUMENTO
  // =========================================

  nuevoDocumento(): void {

    this.mostrarModalNuevo =
      true;

  }


  // =========================================
  // CERRAR NUEVO
  // =========================================

  cerrarNuevoDocumento(): void {

    this.mostrarModalNuevo =
      false;

  }


  // =========================================
  // DOCUMENTO REGISTRADO
  // =========================================

  documentoRegistrado(
    expediente: any
  ): void {

    console.log(
      'NUEVO DOCUMENTO QR3:',
      expediente
    );


    this.cargarDocumentos();

  }


  // =========================================
  // VER CASO
  // =========================================

  verCaso(
    documento: any
  ): void {

    if (
      !documento
    ) {

      return;

    }


    console.log(
      'VER CASO QR3:',
      documento
    );


    this.documentoSeleccionado =
      documento;


    this.mostrarVerCaso =
      true;

  }


  // =========================================
  // CERRAR VER CASO
  // =========================================

  cerrarVerCaso(): void {

    this.mostrarVerCaso =
      false;


    this.documentoSeleccionado =
      null;

  }


  // =========================================
  // SOLICITUD DE ENVÍO QRD3 -> QRD2
  //
  // IMPORTANTE:
  //
  // Todavía NO modificamos el expediente aquí.
  //
  // El siguiente paso será crear un endpoint
  // backend que haga una transacción:
  //
  // EXP_EXPEDIENTE:
  // NIVEL_ACTUAL = 2
  // ID_ESTADO = 2
  //
  // +
  //
  // EXP_EXPEDIENTE_MOVIMIENTO:
  // ORIGEN = 3
  // DESTINO = 2
  // ACCION = ENVIADO
  // OBSERVACION = ...
  // =========================================

  enviarAQr2(
    expediente: any
  ): void {

    if (
      !expediente ||
      !expediente.idExpediente
    ) {

      return;

    }


    this.expedienteService
      .enviarANivel2(
        expediente.idExpediente
      )
      .subscribe({

        next: (respuesta: any) => {

          this.finalizarEnvioQr2(
            respuesta || expediente
          );

        },

        error: (error: any) => {

          console.error(
            'ERROR AL ENVIAR QRD3 A QRD2:',
            error
          );

          Swal.fire({
            icon: 'error',
            title: 'No se pudo enviar el expediente',
            text:
              error?.error?.message ||
              error?.error?.mensaje ||
              'Ocurrió un error al enviar el expediente a QRD Nivel 2.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#176b49'
          });

        }

      });

  }


  // =========================================
  // ENVÍO QRD3 -> QRD2 COMPLETADO
  // =========================================

  finalizarEnvioQr2(
    expediente: any
  ): void {

    console.log(
      'EXPEDIENTE QR3 ENVIADO A QRD2:',
      expediente
    );


    this.cerrarVerCaso();


    this.cargarDocumentos();


    Swal.fire({

      icon:
        'success',


      title:
        'Expediente enviado',


      text:
        'El expediente fue enviado correctamente a QRD Nivel 2.',


      confirmButtonText:
        'OK',


      confirmButtonColor:
        '#176b49'

    });

  }


  // =========================================
  // EDITAR
  // =========================================

  editarDocumento(
    documento: any
  ): void {

    if (
      !documento ||
      !documento.idExpediente
    ) {

      return;

    }


    console.log(
      'EDITAR DOCUMENTO QR3:',
      documento
    );


    this.documentoEditar =
      documento;


    this.mostrarEditar =
      true;

  }


  // =========================================
  // CERRAR EDITAR
  // =========================================

  cerrarEditar(): void {

    this.mostrarEditar =
      false;


    this.documentoEditar =
      null;

  }


  // =========================================
  // ACTUALIZADO
  // =========================================

  documentoActualizado(
    expediente: any
  ): void {

    console.log(
      'DOCUMENTO QR3 ACTUALIZADO:',
      expediente
    );


    this.cerrarEditar();


    this.cargarDocumentos();

  }


  // =========================================
  // ELIMINAR
  // =========================================

  eliminarDocumento(
    documento: any
  ): void {

    if (
      !documento ||
      !documento.idExpediente
    ) {

      return;

    }


    Swal.fire({

      title:
        '¿Eliminar expediente?',


      html:
        `
        <div style="
          font-size: 13px;
          color: #626d68;
          margin-top: 5px;
        ">

          Se eliminará el expediente

          <br><br>

          <strong style="
            color: #176b49;
            font-size: 14px;
          ">
            ${documento.cinv}
          </strong>

          <br><br>

          <span style="
            font-size: 12px;
            color: #7a8580;
          ">

            El documento dejará de aparecer
            en el registro de QRD Nivel 3.

          </span>

        </div>
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
        (
          resultado
        ) => {

          if (
            !resultado.isConfirmed
          ) {

            return;

          }


          this.expedienteService
            .eliminarExpediente(
              documento.idExpediente
            )
            .subscribe({

              next: () => {

                if (
                  this.documentoSeleccionado
                  &&
                  Number(
                    this.documentoSeleccionado
                      .idExpediente
                  ) ===
                  Number(
                    documento.idExpediente
                  )
                ) {

                  this.cerrarVerCaso();

                }


                if (
                  this.documentoEditar
                  &&
                  Number(
                    this.documentoEditar
                      .idExpediente
                  ) ===
                  Number(
                    documento.idExpediente
                  )
                ) {

                  this.cerrarEditar();

                }


                this.cargarDocumentos();


                Swal.fire({

                  title:
                    'Expediente eliminado',


                  text:
                    'El documento fue eliminado correctamente.',


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
                  'ERROR AL ELIMINAR QR3:',
                  err
                );


                Swal.fire({

                  title:
                    'No se pudo eliminar',


                  text:
                    'Ocurrió un error al eliminar el expediente.',


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
  // BUSCADOR
  // =========================================

  buscarDocumentos(): void {

    const texto =
      this.search
        .trim()
        .toLowerCase();


    if (
      !texto
    ) {

      this.documentos = [
        ...this.documentosOriginales
      ];

      return;

    }


    this.documentos =
      this.documentosOriginales.filter(
        (
          doc: any
        ) => {

          return (

            String(
              doc.cinv || ''
            )
              .toLowerCase()
              .includes(
                texto
              )

            ||

            String(
              doc.categoriaQrd || ''
            )
              .toLowerCase()
              .includes(
                texto
              )

            ||

            String(
              doc.documento || ''
            )
              .toLowerCase()
              .includes(
                texto
              )

            ||

            String(
              doc.nroDocumento || ''
            )
              .toLowerCase()
              .includes(
                texto
              )

            ||

            String(
              doc.asunto || ''
            )
              .toLowerCase()
              .includes(
                texto
              )

            ||

            String(
              doc.estado || ''
            )
              .toLowerCase()
              .includes(
                texto
              )

          );

        }
      );

  }


  // =========================================
  // LIMPIAR
  // =========================================

  limpiarBusqueda(): void {

    this.search =
      '';


    this.documentos = [
      ...this.documentosOriginales
    ];

  }

}
