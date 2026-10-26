import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  forkJoin,
  of
} from 'rxjs';

import {
  catchError,
  map
} from 'rxjs/operators';

import {
  ExpedienteService
} from '../../services/expediente.service';

import {
  UsersService
} from '../../services/users.service';

import {
  VerCasoComponent
} from './ver-caso/ver-caso.component';


@Component({
  selector: 'app-total-reg',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    VerCasoComponent
  ],

  templateUrl:
    './total-reg.component.html',

  styleUrl:
    './total-reg.component.css'
})
export class TotalRegComponent
  implements OnInit {


  // =========================================
  // BUSCADOR
  // =========================================

  search: string = '';


  // =========================================
  // PAGINACIÓN
  // =========================================

  pageSize: number = 5;


  // =========================================
  // DOCUMENTOS
  // =========================================

  documentos: any[] = [];

  documentosFiltrados: any[] = [];


  // =========================================
  // CATÁLOGOS
  // =========================================

  tiposDocumento: any[] = [];

  nucleos: any[] = [];


  // =========================================
  // MODAL VER CASO
  // =========================================

  mostrarVerCaso: boolean = false;

  expedienteSeleccionado: any = null;


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

    this.cargarCatalogosBase();

  }


  // =========================================
  // CARGAR CATÁLOGOS BASE
  // =========================================

  cargarCatalogosBase(): void {

    forkJoin({

      tiposDocumento:
        this.expedienteService
          .getTiposDocumento(),

      nucleos:
        this.usersService
          .getNucleos()

    })
    .subscribe({

      next: (respuesta) => {


        this.tiposDocumento =
          respuesta.tiposDocumento || [];


        this.nucleos =
          respuesta.nucleos || [];


        this.cargarDocumentos();

      },


      error: (err) => {

        console.error(
          'ERROR AL CARGAR CATÁLOGOS BASE:',
          err
        );

      }

    });

  }


  // =========================================
  // CARGAR EXPEDIENTES ADMINISTRADOR
  //
  // SOLO:
  //
  // ACTIVO = S
  //
  // Y:
  //
  // 2 = ENVIADO
  // 3 = OBSERVADO
  // 4 = CONCLUIDO
  //
  // 1 = REGISTRADO NO APARECE
  // =========================================

  cargarDocumentos(): void {

    this.expedienteService
      .listarExpedientes()
      .subscribe({

        next: (data) => {

          const expedientes =
            data || [];


          console.log(
            'TODOS LOS EXPEDIENTES:',
            expedientes
          );


          // =====================================
          // FILTRO ADMINISTRADOR
          // =====================================

          const expedientesAdmin =
            expedientes.filter(
              (exp: any) =>

                String(
                  exp.activo || ''
                )
                  .trim()
                  .toUpperCase() === 'S'

                &&

                Number(
                  exp.idEstado
                ) !== 1

            );


          console.log(
            'EXPEDIENTES VISIBLES ADMIN:',
            expedientesAdmin
          );


          // =====================================
          // SIN DOCUMENTOS
          // =====================================

          if (
            expedientesAdmin.length === 0
          ) {

            this.documentos = [];

            this.documentosFiltrados = [];

            return;

          }


          // =====================================
          // PREPARAR EXPEDIENTES
          // =====================================

          const consultas =
            expedientesAdmin.map(
              (exp: any) => {

                return this.prepararExpediente(
                  exp
                );

              }
            );


          // =====================================
          // ESPERAR TODOS
          // =====================================

          forkJoin(
            consultas
          )
          .subscribe({

            next: (
              documentosPreparados
            ) => {

              this.documentos =
                documentosPreparados;


              this.documentosFiltrados =
                [...this.documentos];


              console.log(
                'DOCUMENTOS ADMINISTRADOR:',
                this.documentos
              );

            },


            error: (err) => {

              console.error(
                'ERROR PREPARANDO DOCUMENTOS:',
                err
              );

            }

          });

        },


        error: (err) => {

          console.error(
            'ERROR AL CARGAR EXPEDIENTES:',
            err
          );

        }

      });

  }


  // =========================================
  // PREPARAR EXPEDIENTE
  // =========================================

  prepararExpediente(
    exp: any
  ) {


    // =========================================
    // TIPO DOCUMENTO
    // =========================================

    const tipoDocumento =
      this.tiposDocumento.find(
        (tipo: any) =>

          Number(
            tipo.idTipoDocumento
          ) ===

          Number(
            exp.idTipoDocumento
          )

      );


    // =========================================
    // NÚCLEO
    // =========================================

    const nucleo =
      this.nucleos.find(
        (item: any) =>

          String(
            item.idNucleo
          ) ===

          String(
            exp.idNucleo
          )

      );


    // =========================================
    // DATOS BASE
    // =========================================

    const base = {

      ...exp,


      // =====================================
      // TIPO DOCUMENTO
      // =====================================

      documento:
        tipoDocumento
          ? tipoDocumento.nombre
          : exp.idTipoDocumento,


      // =====================================
      // NÚCLEO
      // =====================================

      nombreNucleo:
        nucleo
          ? nucleo.nombre
          : exp.idNucleo,


      // =====================================
      // ESTADO REAL DEL EXPEDIENTE
      //
      // YA NO USAMOS ID_SITUACION
      // =====================================

      estado:
        this.obtenerEstado(
          exp.idEstado
        ),


      // =====================================
      // CLASE CSS DEL ESTADO
      // =====================================

      estadoClase:
        this.obtenerClaseEstado(
          exp.idEstado
        ),


      // =====================================
      // MENÚ
      // =====================================

      menuAbierto:
        false

    };


    // =========================================
    // SI NO HAY NÚCLEO O BRIGADA
    // =========================================

    if (
      !exp.idNucleo ||
      !exp.idBrigada
    ) {

      return of({

        ...base,

        nombreBrigada:
          exp.idBrigada || '-',

        ubicacion:
          exp.idUnidad || '-'

      });

    }


    // =========================================
    // CONSULTAR UBICACIÓN
    // =========================================

    return forkJoin({

      brigadas:
        this.usersService
          .getBrigadas(
            exp.idNucleo
          ),

      unidades:
        this.usersService
          .getUnidades(
            exp.idNucleo,
            exp.idBrigada
          )

    })
    .pipe(

      map(
        (resultado: any) => {


          // =====================================
          // GRAN UNIDAD
          // =====================================

          const brigada =
            (resultado.brigadas || [])
              .find(
                (item: any) =>

                  String(
                    item.idBrigada
                  ) ===

                  String(
                    exp.idBrigada
                  )

              );


          // =====================================
          // UNIDAD
          // =====================================

          const unidad =
            (resultado.unidades || [])
              .find(
                (item: any) =>

                  String(
                    item.idUnidad
                  ) ===

                  String(
                    exp.idUnidad
                  )

              );


          return {

            ...base,


            nombreBrigada:
              brigada
                ? brigada.nombre
                : exp.idBrigada,


            ubicacion:
              unidad
                ? unidad.nombre
                : exp.idUnidad

          };

        }
      ),


      // =====================================
      // SI FALLA UBICACIÓN
      // =====================================

      catchError(
        (err) => {

          console.error(
            'ERROR PREPARANDO UBICACIÓN DEL EXPEDIENTE:',
            exp.idExpediente,
            err
          );


          return of({

            ...base,

            nombreBrigada:
              exp.idBrigada || '-',

            ubicacion:
              exp.idUnidad || '-'

          });

        }
      )

    );

  }


  // =========================================
  // OBTENER ESTADO REAL
  //
  // EXP_ESTADO_EXPEDIENTE
  // =========================================

  obtenerEstado(
    idEstado: number
  ): string {

    switch (
      Number(
        idEstado
      )
    ) {

      case 1:
        return 'REGISTRADO';

      case 2:
        return 'ENVIADO';

      case 3:
        return 'OBSERVADO';

      case 4:
        return 'CONCLUIDO';

      default:
        return '-';

    }

  }


  // =========================================
  // CLASE CSS DEL ESTADO
  // =========================================

  obtenerClaseEstado(
    idEstado: number
  ): string {

    switch (
      Number(
        idEstado
      )
    ) {

      case 1:
        return 'estado-registrado';

      case 2:
        return 'estado-enviado';

      case 3:
        return 'estado-observado';

      case 4:
        return 'estado-concluido';

      default:
        return 'estado-default';

    }

  }


  // =========================================
  // BUSCADOR DINÁMICO
  // =========================================

  buscar(): void {

    const texto =
      this.search
        .trim()
        .toLowerCase();


    if (!texto) {

      this.documentosFiltrados =
        [...this.documentos];

      return;

    }


    this.documentosFiltrados =
      this.documentos.filter(
        (doc: any) => {

          return (

            doc.cinv
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.categoria
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.asunto
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.descripcion
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.estado
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.ubicacion
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.nombreNucleo
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.nombreBrigada
              ?.toLowerCase()
              .includes(texto)

            ||

            doc.documento
              ?.toLowerCase()
              .includes(texto)

          );

        }
      );

  }


  // =========================================
  // LIMPIAR BUSCADOR
  // =========================================

  limpiarBusqueda(): void {

    this.search = '';

    this.documentosFiltrados =
      [...this.documentos];

  }


  // =========================================
  // ABRIR / CERRAR MENÚ
  // =========================================

  toggleMenu(
    doc: any
  ): void {


    this.documentos.forEach(
      (item: any) => {

        if (
          item !== doc
        ) {

          item.menuAbierto =
            false;

        }

      }
    );


    doc.menuAbierto =
      !doc.menuAbierto;

  }


  // =========================================
  // VER CASO
  // =========================================

  verCaso(
    doc: any
  ): void {

    this.expedienteSeleccionado =
      doc;


    this.mostrarVerCaso =
      true;


    doc.menuAbierto =
      false;

  }


  // =========================================
  // CERRAR VER CASO
  // =========================================

  cerrarVerCaso(): void {

    this.mostrarVerCaso =
      false;

    this.expedienteSeleccionado =
      null;

  }


  // =========================================
  // TRAZABILIDAD
  // =========================================

  verTrazabilidad(
    doc: any
  ): void {

    console.log(
      'VER TRAZABILIDAD:',
      doc
    );


    doc.menuAbierto =
      false;

  }

}