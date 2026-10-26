import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import Swal from 'sweetalert2';

import {
  IntegridadService
} from '../../../../services/integridad.service';

import {
  ExpedienteService
} from '../../../../services/expediente.service';


@Component({
  selector: 'app-ver-caso-integridad',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './ver-caso-integridad.component.html',

  styleUrl:
    './ver-caso-integridad.component.css'
})
export class VerCasoIntegridadComponent
  implements OnInit, OnChanges, OnDestroy {


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
  enviado =
    new EventEmitter<void>();


  // =========================================
  // DATOS DEL CASO
  // =========================================

  detalle: any = null;

  cargandoDetalle: boolean =
    false;

  errorDetalle: string =
    '';


  // =========================================
  // TAB ACTIVO
  // =========================================

  tabActivo: string =
    'registrado';


  // =========================================
  // PDFs
  // =========================================

  archivos: any[] =
    [];

  archivoSeleccionado: any =
    null;

  pdfUrl: SafeResourceUrl | null =
    null;

  objectUrlActual: string | null =
    null;

  cargandoArchivos: boolean =
    false;

  errorArchivos: string =
    '';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private integridadService:
      IntegridadService,

    private expedienteService:
      ExpedienteService,

    private sanitizer:
      DomSanitizer

  ) { }


  // =========================================
  // ON INIT
  // =========================================

  ngOnInit(): void {

    this.inicializarCaso();

  }


  // =========================================
  // ON CHANGES
  // =========================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['denuncia'] &&
      !changes['denuncia'].firstChange
    ) {

      this.inicializarCaso();

    }

  }


  // =========================================
  // ON DESTROY
  // =========================================

  ngOnDestroy(): void {

    this.liberarPdf();

  }


  // =========================================
  // INICIALIZAR CASO
  // =========================================

  inicializarCaso(): void {

    if (
      !this.denuncia ||
      !this.denuncia.idExpediente
    ) {

      return;

    }


    this.tabActivo =
      'registrado';


    this.detalle =
      null;


    this.archivos =
      [];


    this.archivoSeleccionado =
      null;


    this.liberarPdf();


    this.errorDetalle =
      '';


    this.errorArchivos =
      '';


    this.cargarDetalle();

    this.cargarArchivos();

  }


  // =========================================
  // CARGAR DETALLE DE INTEGRIDAD
  // =========================================

  cargarDetalle(): void {

    const idExpediente =
      Number(
        this.denuncia?.idExpediente
      );


    if (
      !idExpediente ||
      idExpediente <= 0
    ) {

      this.errorDetalle =
        'No se pudo identificar el expediente.';

      return;

    }


    this.cargandoDetalle =
      true;


    this.errorDetalle =
      '';


    this.integridadService
      .obtenerDetalle(
        idExpediente
      )
      .subscribe({

        next: (
          response: any
        ) => {

          this.detalle =
            response;


          this.cargandoDetalle =
            false;

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error al cargar detalle Integridad:',
            error
          );


          this.cargandoDetalle =
            false;


          this.errorDetalle =
            error?.error?.message ||
            error?.error ||
            'No se pudo cargar la información del caso.';

        }

      });

  }


  // =========================================
  // CAMBIAR TAB
  // =========================================

  cambiarTab(
    tab: string
  ): void {

    this.tabActivo =
      tab;

  }


  // =========================================
  // CARGAR PDFs
  // =========================================

  cargarArchivos(): void {

    const idExpediente =
      Number(
        this.denuncia?.idExpediente
      );


    if (
      !idExpediente ||
      idExpediente <= 0
    ) {

      return;

    }


    this.cargandoArchivos =
      true;


    this.errorArchivos =
      '';


    this.expedienteService
      .listarArchivosExpediente(
        idExpediente
      )
      .subscribe({

        next: (
          response: any
        ) => {

          this.cargandoArchivos =
            false;


          this.archivos =
            Array.isArray(response)
              ? response
              : [];


          if (
            this.archivos.length > 0
          ) {

            this.seleccionarArchivo(
              this.archivos[0]
            );

          }

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error al cargar archivos:',
            error
          );


          this.cargandoArchivos =
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


    this.liberarPdf();


    this.expedienteService
      .verArchivo(
        archivo.idArchivo
      )
      .subscribe({

        next: (
          blob: Blob
        ) => {

          const objectUrl =
            URL.createObjectURL(
              blob
            );


          this.objectUrlActual =
            objectUrl;


          this.pdfUrl =
            this.sanitizer
              .bypassSecurityTrustResourceUrl(
                objectUrl
              );

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error al visualizar PDF:',
            error
          );


          Swal.fire({

            icon:
              'error',

            title:
              'Error',

            text:
              'No se pudo visualizar el documento PDF.'

          });

        }

      });

  }


  // =========================================
  // LIBERAR URL DEL PDF
  // =========================================

  liberarPdf(): void {

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
  // MOTIVO COMPLETO
  // =========================================

  obtenerMotivoCompleto(
    motivo: string
  ): string {

    const motivos: any = {

      APROPIACION:
        'Apropiación o uso indebido de recursos, bienes o información del Estado.',

      FAVORECIMIENTO:
        'Favorecimiento indebido.',

      VENTAJAS:
        'Acceso a ventajas indebidas.',

      INFLUENCIAS:
        'Invocación de influencias en el Estado.',

      CONFLICTO:
        'Mantener intereses en conflicto.',

      OBSTRUCCION:
        'Obstrucción al acceso a la información pública.',

      AUTORIDAD:
        'Abuso de autoridad.',

      OTROS:
        'Otros.'

    };


    return (
      motivos[motivo] ||
      motivo ||
      '-'
    );

  }


  // =========================================
  // MOSTRAR VALOR
  // =========================================

  mostrarValor(
    valor: any
  ): string {

    if (
      valor === null ||
      valor === undefined ||
      String(valor).trim() === ''
    ) {

      return '-';

    }


    return String(
      valor
    );

  }


  // =========================================
  // ENVIAR A INSPECTORÍA NIVEL 3
  //
  // TODAVÍA NO TOCAMOS ESTA PARTE
  // =========================================

  enviarANivel3(): void {

    Swal.fire({

      icon:
        'info',

      title:
        'Enviar a Inspectoría Integridad Nivel 3',

      text:
        'Ahora vamos a conectar esta acción con el backend.',

      confirmButtonText:
        'Aceptar'

    });

  }


  // =========================================
  // SALIR
  // =========================================

  salir(): void {

    this.liberarPdf();

    this.cerrar.emit();

  }

}