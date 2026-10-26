import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import {
  NuevoRegistroIntegridadComponent
} from './nuevo-registro-integridad/nuevo-registro-integridad.component';

import {
  VerCasoIntegridadComponent
} from './ver-caso-integridad/ver-caso-integridad.component';

import {
  EditarIntegridadComponent
} from './editar-integridad/editar-integridad.component';

import {
  IntegridadService
} from '../../../services/integridad.service';


@Component({
  selector: 'app-registrar-integridad',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    NuevoRegistroIntegridadComponent,
    VerCasoIntegridadComponent,
    EditarIntegridadComponent
  ],

  templateUrl:
    './registrar-integridad.component.html',

  styleUrl:
    './registrar-integridad.component.css'
})
export class RegistrarIntegridadComponent
  implements OnInit {


  // =========================================
  // BUSCADOR
  // =========================================

  search =
    '';


  // =========================================
  // TABLA
  // =========================================

  denuncias: any[] =
    [];

  todasDenuncias: any[] =
    [];


  // =========================================
  // PAGINACIÓN
  // =========================================

  paginaActual =
    1;

  registrosPorPagina =
    10;


  // =========================================
  // NUEVO
  // =========================================

  mostrarModalNuevo =
    false;


  // =========================================
  // MENSAJE REGISTRO
  // =========================================

  mensajeExito =
    '';

  cinvExito =
    '';


  // =========================================
  // VER CASO
  // =========================================

  mostrarVerCaso =
    false;

  denunciaSeleccionada: any =
    null;


  // =========================================
  // EDITAR
  // =========================================

  mostrarEditar =
    false;

  denunciaEditar: any =
    null;


  // =========================================
  // MENÚ
  // =========================================

  menuAbiertoId:
    number | null =
    null;


  constructor(
    private integridadService:
      IntegridadService
  ) { }


  ngOnInit(): void {

    this.cargarDenuncias();

  }


  // =========================================
  // LISTAR
  // =========================================

  cargarDenuncias(): void {

    this.integridadService
      .listarRegistrados()
      .subscribe({


        next: (
          data
        ) => {


          this.todasDenuncias =
            data || [];


          this.denuncias = [
            ...this.todasDenuncias
          ];


          this.paginaActual =
            1;

        },


        error: (
          err
        ) => {


          console.error(
            'Error listando denuncias:',
            err
          );


          this.denuncias =
            [];


          this.todasDenuncias =
            [];


          this.paginaActual =
            1;

        }

      });

  }


  // =========================================
  // TOTAL PÁGINAS
  // =========================================

  get totalPaginas(): number {

    return Math.max(

      1,

      Math.ceil(
        this.denuncias.length /
        this.registrosPorPagina
      )

    );

  }


  // =========================================
  // DENUNCIAS PAGINADAS
  // =========================================

  get denunciasPaginadas(): any[] {

    const inicio =
      (
        this.paginaActual - 1
      )
      *
      this.registrosPorPagina;


    const fin =
      inicio +
      this.registrosPorPagina;


    return this.denuncias.slice(
      inicio,
      fin
    );

  }


  // =========================================
  // LISTA DE PÁGINAS
  // =========================================

  get paginas(): number[] {

    return Array.from(
      {
        length:
          this.totalPaginas
      },
      (
        _,
        i
      ) =>
        i + 1
    );

  }


  // =========================================
  // PRIMER REGISTRO MOSTRADO
  // =========================================

  get primerRegistroMostrado(): number {

    if (
      this.denuncias.length === 0
    ) {

      return 0;

    }


    return (
      (
        this.paginaActual - 1
      )
      *
      this.registrosPorPagina
    ) + 1;

  }


  // =========================================
  // ÚLTIMO REGISTRO MOSTRADO
  // =========================================

  get ultimoRegistroMostrado(): number {

    return Math.min(

      this.paginaActual *
      this.registrosPorPagina,

      this.denuncias.length

    );

  }


  // =========================================
  // CAMBIAR PÁGINA
  // =========================================

  cambiarPagina(
    pagina: number
  ): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {

      return;

    }


    this.paginaActual =
      pagina;

  }


  // =========================================
  // NUEVO
  // =========================================

  nuevoDocumento(): void {

    this.mostrarModalNuevo =
      true;

  }


  cerrarNuevoDocumento(): void {

    this.mostrarModalNuevo =
      false;

  }


  registroGuardado(
    respuesta: any
  ): void {

    this.mostrarModalNuevo =
      false;


    this.cinvExito =
      respuesta?.cinv ?? '';


    this.mensajeExito =
      'La denuncia fue registrada correctamente.';


    this.cargarDenuncias();

  }


  cerrarMensajeExito(): void {

    this.mensajeExito =
      '';

    this.cinvExito =
      '';

  }


  // =========================================
  // VER CASO
  // =========================================

  verCaso(
    denuncia: any
  ): void {

    if (!denuncia) {

      return;

    }


    this.menuAbiertoId =
      null;


    this.denunciaSeleccionada =
      denuncia;


    this.mostrarVerCaso =
      true;

  }


  cerrarVerCaso(): void {

    this.mostrarVerCaso =
      false;


    this.denunciaSeleccionada =
      null;


    this.cargarDenuncias();

  }


  // =========================================
  // MENÚ
  // =========================================

  toggleMenuAcciones(
    denuncia: any,
    event: MouseEvent
  ): void {

    event.stopPropagation();


    const id =
      Number(
        denuncia?.idExpediente
      );


    if (
      !id ||
      id <= 0
    ) {

      this.menuAbiertoId =
        null;

      return;

    }


    this.menuAbiertoId =
      this.menuAbiertoId === id
        ? null
        : id;

  }


  // =========================================
  // EDITAR
  // =========================================

  editarCaso(
    denuncia: any
  ): void {

    if (
      !denuncia?.idExpediente
    ) {

      return;

    }


    this.menuAbiertoId =
      null;


    this.denunciaEditar =
      denuncia;


    this.mostrarEditar =
      true;

  }


  cerrarEditar(): void {

    this.mostrarEditar =
      false;


    this.denunciaEditar =
      null;

  }


  denunciaActualizada(
    respuesta: any
  ): void {

    console.log(
      'Denuncia actualizada:',
      respuesta
    );


    this.mostrarEditar =
      false;


    this.denunciaEditar =
      null;


    this.cargarDenuncias();

  }


  // =========================================
  // ELIMINAR
  // =========================================

  eliminarCaso(
    denuncia: any
  ): void {

    this.menuAbiertoId =
      null;


    const idExpediente =
      Number(
        denuncia?.idExpediente
      );


    if (
      !idExpediente ||
      idExpediente <= 0
    ) {

      return;

    }


    const cinv =
      denuncia?.cinv ||
      'esta denuncia';


    Swal.fire({

      icon:
        'warning',

      title:
        '¿Eliminar denuncia?',

      html:
        `Se eliminará <b>${cinv}</b> del listado.<br><br>
         El registro permanecerá en la base de datos para auditoría.`,

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


          this.integridadService
            .eliminarDenuncia(
              idExpediente
            )
            .subscribe({


              next: () => {


                Swal.fire({

                  icon:
                    'success',

                  title:
                    'Eliminado',

                  text:
                    'La denuncia fue eliminada correctamente.',

                  confirmButtonText:
                    'Aceptar'

                });


                this.cargarDenuncias();

              },


              error: (
                err: any
              ) => {


                console.error(
                  'Error eliminando denuncia:',
                  err
                );


                Swal.fire({

                  icon:
                    'error',

                  title:
                    'Error',

                  text:
                    err?.error?.message ||
                    err?.error ||
                    'No se pudo eliminar la denuncia.'

                });

              }

            });

        }
      );

  }


  // =========================================
  // BUSCAR
  // =========================================

  buscar(): void {

    const texto =
      this.search
        .trim()
        .toLowerCase();


    this.paginaActual =
      1;


    if (!texto) {

      this.denuncias = [
        ...this.todasDenuncias
      ];

      return;

    }


    this.denuncias =
      this.todasDenuncias
        .filter(
          (
            d: any
          ) => {


            const cinv =
              String(
                d.cinv || ''
              )
                .toLowerCase();


            return cinv.includes(
              texto
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


    this.denuncias = [
      ...this.todasDenuncias
    ];


    this.paginaActual =
      1;

  }


  // =========================================
  // MOTIVO
  // =========================================

  obtenerMotivoCompleto(
    motivo: string
  ): string {

    switch (
      motivo
    ) {

      case 'APROPIACION':

        return 'Apropiación o uso indebido de recursos, bienes o información del Estado.';


      case 'FAVORECIMIENTO':

        return 'Favorecimiento indebido.';


      case 'VENTAJAS':

        return 'Acceso a ventajas indebidas.';


      case 'INFLUENCIAS':

        return 'Invocación de influencias en el Estado.';


      case 'CONFLICTO':

        return 'Mantener intereses en conflicto.';


      case 'OBSTRUCCION':

        return 'Obstrucción al acceso a la información pública.';


      case 'AUTORIDAD':

        return 'Abuso de autoridad.';


      case 'OTROS':

        return 'Otros.';


      default:

        return motivo || '-';

    }

  }

}