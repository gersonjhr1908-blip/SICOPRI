import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  NuevoDocumentoComponent
} from './nuevo-documento/nuevo-documento.component';

import {
  VerCasoQrdComponent
} from './ver-caso-qrd/ver-caso-qrd.component';

import {
  EditarDocumentoQrdComponent
} from './editar-documento-qrd/editar-documento-qrd.component';

import {
  ExpedienteService
} from '../../../services/expediente.service';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-registrar',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    NuevoDocumentoComponent,
    VerCasoQrdComponent,
    EditarDocumentoQrdComponent
  ],

  templateUrl:
    './registrar.component.html',

  styleUrl:
    './registrar.component.css'
})
export class RegistrarComponent
  implements OnInit {


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
  // MODAL NUEVO DOCUMENTO
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
  // INICIO
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
            'ERROR TIPOS DOCUMENTO:',
            err
          );

        }

      });

  }


  // =========================================
  // CARGAR DOCUMENTOS QRD
  //
  // SOLO:
  // ACTIVO = S
  // ESTADO = 1
  // NIVEL ACTUAL = 2
  // TIPO = 1,2,3
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
            'EXPEDIENTES RECIBIDOS:',
            expedientes
          );


          // =====================================
          // FILTRO QRD NIVEL 2
          // =====================================

          const qrdNivel2 =
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


                const idTipoExpediente =
                  Number(
                    exp.idTipoExpediente
                  );


                return (

                  activo === 'S'

                  &&

                  Number(
                    exp.idEstado
                  ) === 1

                  &&

                  Number(
                    exp.nivelActual
                  ) === 2

                  &&

                  categoriaSistema !==
                    'INTEGRIDAD'

                  &&

                  [1, 2, 3].includes(
                    idTipoExpediente
                  )

                );

              }
            );


          // =====================================
          // DATOS PARA TABLA
          // =====================================

          this.documentosOriginales =
            qrdNivel2.map(
              (
                exp: any
              ) => {


                return {

                  ...exp,


                  // =================================
                  // CATEGORÍA QRD
                  // =================================

                  categoriaQrd:
                    this.obtenerCategoriaQrd(
                      exp.idTipoExpediente
                    ),


                  // =================================
                  // TIPO DOCUMENTO
                  // =================================

                  documento:
                    this.obtenerTipoDocumento(
                      exp
                    ),


                  // =================================
                  // ESTADO
                  // =================================

                  estado:
                    'REGISTRADO'

                };

              }
            );


          this.documentos = [
            ...this.documentosOriginales
          ];


          console.log(
            'QRD REGISTRADOS:',
            this.documentos
          );

        },


        error: (
          err
        ) => {

          console.error(
            'ERROR AL LISTAR EXPEDIENTES:',
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
  //
  // 1 DENUNCIA
  // 2 QUEJA
  // 3 RECLAMO
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
  // OBTENER TIPO DOCUMENTO
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


    // =====================================
    // SI ES OTROS
    // =====================================

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
      'NUEVO DOCUMENTO REGISTRADO:',
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
      'VER CASO QRD:',
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
  // ENVIAR A NIVEL 3
  //
  // IMPORTANTE:
  //
  // AUNQUE NIVEL_DESTINO = 4,
  // QRD NIVEL 2 SIEMPRE ENVÍA
  // PRIMERO A NIVEL 3.
  // =========================================

  enviarAInspectoriaNivel3(
    expediente: any
  ): void {


    if (
      !expediente ||
      !expediente.idExpediente
    ) {

      return;

    }


    Swal.fire({

      title:
        '¿Enviar a Inspectoría Nivel 3?',


      html:
        `
        <div style="
          font-size: 13px;
          color: #626d68;
          margin-top: 5px;
        ">

          El expediente

          <br><br>

          <strong style="
            color: #176b49;
            font-size: 14px;
          ">
            ${expediente.cinv}
          </strong>

          <br><br>

          será enviado a Inspectoría Nivel 3.

          <br><br>

          <span style="
            font-size: 12px;
            color: #7a8580;
          ">

            El documento dejará de aparecer
            en el listado de Registrar.

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
        (
          resultado
        ) => {


          if (
            !resultado.isConfirmed
          ) {

            return;

          }


          this.expedienteService
            .enviarANivel3(
              expediente.idExpediente
            )
            .subscribe({


              next: (
                expedienteEnviado
              ) => {


                console.log(
                  'EXPEDIENTE ENVIADO A NIVEL 3:',
                  expedienteEnviado
                );


                this.cerrarVerCaso();


                this.cargarDocumentos();


                Swal.fire({

                  title:
                    'Expediente enviado',


                  html:
                    `
                    <div style="
                      font-size: 13px;
                      color: #626d68;
                    ">

                      El expediente

                      <br><br>

                      <strong style="
                        color: #176b49;
                      ">
                        ${expediente.cinv}
                      </strong>

                      <br><br>

                      fue enviado correctamente
                      a Inspectoría Nivel 3.

                    </div>
                    `,


                  icon:
                    'success',


                  confirmButtonText:
                    'OK',


                  confirmButtonColor:
                    '#176b49',


                  allowOutsideClick:
                    false

                });

              },


              error: (
                err
              ) => {

                console.error(
                  'ERROR AL ENVIAR A NIVEL 3:',
                  err
                );


                let mensaje =
                  'Ocurrió un error al enviar el expediente a Inspectoría Nivel 3.';


                if (
                  err?.error?.message
                ) {

                  mensaje =
                    err.error.message;

                }


                Swal.fire({

                  title:
                    'No se pudo enviar',


                  text:
                    mensaje,


                  icon:
                    'error',


                  confirmButtonText:
                    'OK',


                  confirmButtonColor:
                    '#176b49',


                  allowOutsideClick:
                    false

                });

              }

            });

        }

      );

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
      'EDITAR DOCUMENTO:',
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
  // DOCUMENTO ACTUALIZADO
  // =========================================

  documentoActualizado(
    expediente: any
  ): void {

    console.log(
      'DOCUMENTO ACTUALIZADO:',
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
            en el listado de Registrar.

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


                console.log(
                  'DOCUMENTO ELIMINADO:',
                  documento.cinv
                );


                // Si estaba abierto en Ver Caso
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


                // Si estaba abierto en Editar
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
                    '#176b49',


                  allowOutsideClick:
                    false

                });

              },


              error: (
                err
              ) => {

                console.error(
                  'ERROR AL ELIMINAR DOCUMENTO:',
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
                    '#176b49',


                  allowOutsideClick:
                    false

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
  // LIMPIAR BUSCADOR
  // =========================================

  limpiarBusqueda(): void {

    this.search =
      '';


    this.documentos = [
      ...this.documentosOriginales
    ];

  }

}