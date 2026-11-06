import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';

import {
  firstValueFrom,
  forkJoin,
  of
} from 'rxjs';

import {
  catchError,
  map,
  switchMap
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


import { TrazabilidadPdfComponent } from '../trazabilidad-qrd/trazabilidad-pdf/trazabilidad-pdf.component';
import { TrazabilidadPdfIntegridadComponent } from '../integridad/listado-integridad-compartido/trazabilidad-pdf-integridad/trazabilidad-pdf-integridad.component';
import { TrazabilidadQrdComponent } from '../trazabilidad-qrd/trazabilidad-qrd.component';

@Component({
  selector: 'app-total-reg',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    VerCasoComponent, TrazabilidadQrdComponent, TrazabilidadPdfComponent, TrazabilidadPdfIntegridadComponent
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

  readonly posicionesMenu: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
  ];
  search: string = '';
  estadoFiltro = 0;
  readonly estadosFiltro = [1, 2, 3, 4, 5];


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
  cargandoCaso = false;
  errorCaso = '';


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


              this.buscar();


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
      categoria: this.obtenerCategoria(exp),


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

  private obtenerCategoria(exp: any): string {
    if (String(exp.categoria ?? '').trim().toUpperCase() === 'INTEGRIDAD') {
      return 'INTEGRIDAD';
    }

    const categorias: Record<number, string> = {
      1: 'DENUNCIA',
      2: 'QUEJA',
      3: 'RECLAMO',
    };

    return categorias[Number(exp.idTipoExpediente)] ?? '—';
  }

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

      case 5:
        return 'ARCHIVADO';

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

      case 5:
        return 'estado-archivado';

      default:
        return 'estado-default';

    }

  }


  // =========================================
  // BUSCADOR DINÁMICO
  // =========================================

  buscar(): void {
    const texto = this.search.trim().toLowerCase();
    this.documentosFiltrados = this.documentos.filter(doc =>
      (this.estadoFiltro === 0 || Number(doc.idEstado) === this.estadoFiltro) &&
      (!texto || [
        doc.cinv, doc.categoria, doc.asunto, doc.descripcion, doc.estado,
        doc.ubicacion, doc.nombreNucleo, doc.nombreBrigada, doc.documento,
      ].some(valor => String(valor ?? '').toLowerCase().includes(texto)))
    );
  }

  limpiarBusqueda(): void {
    this.search = '';
    this.buscar();
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

  editarInspectoria = false;

  verCaso(doc: any, editar = false): void {
    if (this.cargandoCaso) {
      return;
    }

    doc.menuAbierto = false;
    this.errorCaso = '';
    this.cargandoCaso = true;

    this.expedienteService.listarExpedientes().pipe(
      switchMap(expedientes => {
        const actual = expedientes.find(
          exp => Number(exp.idExpediente) === Number(doc.idExpediente)
            && String(exp.activo ?? '').trim().toUpperCase() === 'S',
        );

        return actual ? this.prepararExpediente(actual) : of(null);
      }),
    ).subscribe({
      next: actual => {
        this.cargandoCaso = false;
        if (!actual) {
          this.errorCaso = 'El expediente ya no está disponible.';
          return;
        }

        const actualizarFila = (fila: any) =>
          Number(fila.idExpediente) === Number(doc.idExpediente) ? actual : fila;

        this.documentos = this.documentos.map(actualizarFila);
        this.buscar();
        this.editarInspectoria = editar;
        this.expedienteSeleccionado = actual;
        this.mostrarVerCaso = true;
      },
      error: () => {
        this.cargandoCaso = false;
        this.errorCaso = 'No se pudo consultar el estado actual del expediente.';
      },
    });
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

  documentoTrazabilidad: any = null;
  modoTrazabilidad: 'historial' | 'pdf' = 'historial';

  esIntegridad(doc: any): boolean {
    return String(doc?.categoria ?? '').trim().toUpperCase() === 'INTEGRIDAD';
  }

  verTrazabilidad(doc: any, modo: 'historial' | 'pdf' = 'historial'): void {
    doc.menuAbierto = false;
    this.modoTrazabilidad = modo;
    this.documentoTrazabilidad = doc;
  }
  eliminando = false;

  async eliminar(doc: any): Promise<void> {
    if (this.eliminando) return;
    const id = Number(doc?.idExpediente);
    if (!Number.isSafeInteger(id) || id <= 0) return;

    doc.menuAbierto = false;
    this.eliminando = true;
    try {
      const confirmacion = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar expediente?',
        text: String(doc.cinv ?? ''),
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b42318',
      });
      if (!confirmacion.isConfirmed) return;

      const actual = (await firstValueFrom(this.expedienteService.listarExpedientes()))
        .find(exp => Number(exp.idExpediente) === id && exp.activo === 'S');
      if (!actual) {
        this.cargarDocumentos();
        await Swal.fire('Expediente no disponible', '', 'info');
        return;
      }

      await firstValueFrom(this.expedienteService.eliminarComoAdministrador(id));
      this.cargarDocumentos();
      await Swal.fire('Expediente eliminado', '', 'success');
    } catch (error: any) {
      const detalle = typeof error?.error === 'string' && !error.error.trimStart().startsWith('<')
        ? error.error.trim()
        : error?.error?.message || error?.error?.mensaje;
      const estado = error?.status ? ` (HTTP ${error.status})` : '';
      await Swal.fire(
        'No se pudo eliminar',
        detalle || `El servidor rechazó la operación${estado}.`,
        'error',
      );
    } finally {
      this.eliminando = false;
    }
  }
}






