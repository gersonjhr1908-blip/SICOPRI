import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import {
  ExpedienteService
} from '../../../services/expediente.service';


@Component({
  selector: 'app-ver-caso',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './ver-caso.component.html',

  styleUrl:
    './ver-caso.component.css'
})
export class VerCasoComponent {


  // =========================================
  // EXPEDIENTE SELECCIONADO
  // =========================================

  @Input()
  expediente: any = null;


  // =========================================
  // CERRAR MODAL
  // =========================================

  @Output()
  cerrar =
    new EventEmitter<void>();


  // =========================================
  // PESTAÑA ACTIVA
  //
  // 1 = DOC REGISTRADO
  // 2 = DOC ADJUNTO
  // 3 = SEGUIMIENTO
  // =========================================

  pestanaActiva: number = 1;


  // =========================================
  // ARCHIVOS DEL EXPEDIENTE
  // =========================================

  archivos: any[] = [];


  // =========================================
  // ARCHIVO SELECCIONADO
  // =========================================

  archivoSeleccionado: any = null;


  // =========================================
  // URL SEGURA DEL PDF
  // =========================================

  pdfUrl: SafeResourceUrl | null = null;


  // =========================================
  // URL TEMPORAL DEL BLOB
  //
  // La guardamos para poder liberarla
  // cuando cambiemos de PDF o cerremos.
  // =========================================

  private objectUrlActual: string | null = null;


  // =========================================
  // ESTADO DE CARGA DE ARCHIVOS
  // =========================================

  cargandoArchivos: boolean = false;


  // =========================================
  // ESTADO DE CARGA DEL PDF
  // =========================================

  cargandoPdf: boolean = false;


  // =========================================
  // ERROR
  // =========================================

  errorArchivos: string = '';


  // =========================================
  // CONTROL PARA NO CONSULTAR DOS VECES
  // =========================================

  archivosCargados: boolean = false;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private expedienteService:
      ExpedienteService,

    private sanitizer:
      DomSanitizer

  ) {}


  // =========================================
  // CAMBIAR PESTAÑA
  // =========================================

  cambiarPestana(
    numero: number
  ): void {

    this.pestanaActiva =
      numero;


    // =======================================
    // AL ENTRAR A DOC ADJUNTO
    // CARGAMOS LOS PDFs UNA SOLA VEZ
    // =======================================

    if (
      numero === 2 &&
      !this.archivosCargados
    ) {

      this.cargarArchivos();

    }

  }


  // =========================================
  // CARGAR PDFs DEL EXPEDIENTE
  // =========================================

  cargarArchivos(): void {


    // =======================================
    // VALIDAR EXPEDIENTE
    // =======================================

    if (
      !this.expediente ||
      !this.expediente.idExpediente
    ) {

      this.errorArchivos =
        'No se encontró el ID del expediente.';

      return;

    }


    // =======================================
    // PREPARAR ESTADO
    // =======================================

    this.cargandoArchivos =
      true;

    this.errorArchivos =
      '';

    this.archivos =
      [];

    this.archivoSeleccionado =
      null;

    this.limpiarPdf();


    // =======================================
    // CONSULTAR ARCHIVOS EN BACKEND
    // =======================================

    this.expedienteService
      .listarArchivosExpediente(
        this.expediente.idExpediente
      )
      .subscribe({

        next: (
          respuesta: any[]
        ) => {


          // =================================
          // GUARDAR ARCHIVOS
          // =================================

          this.archivos =
            respuesta || [];


          this.archivosCargados =
            true;


          this.cargandoArchivos =
            false;


          // =================================
          // MOSTRAR PRIMER PDF
          // AUTOMÁTICAMENTE
          // =================================

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
            'ERROR AL CARGAR PDFs:',
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


    // =======================================
    // VALIDAR
    // =======================================

    if (
      !archivo ||
      !archivo.idArchivo
    ) {

      return;

    }


    // =======================================
    // ARCHIVO SELECCIONADO
    // =======================================

    this.archivoSeleccionado =
      archivo;


    // =======================================
    // LIMPIAR PDF ANTERIOR
    // =======================================

    this.limpiarPdf();


    // =======================================
    // CARGANDO
    // =======================================

    this.cargandoPdf =
      true;

    this.errorArchivos =
      '';


    // =======================================
    // SOLICITAR PDF COMO BLOB
    //
    // Importante:
    // esto pasa por HttpClient y por
    // el interceptor/token del sistema.
    // =======================================

    this.expedienteService
      .verArchivo(
        archivo.idArchivo
      )
      .subscribe({

        next: (
          blob: Blob
        ) => {


          // =================================
          // CONSTRUIR BLOB PDF
          // =================================

          const pdfBlob =
            new Blob(
              [blob],
              {
                type: 'application/pdf'
              }
            );


          // =================================
          // CREAR URL TEMPORAL
          // =================================

          this.objectUrlActual =
            URL.createObjectURL(
              pdfBlob
            );


          // =================================
          // HACER URL SEGURA PARA IFRAME
          // =================================

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
            'ERROR AL VISUALIZAR PDF:',
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
  // LIMPIAR PDF ACTUAL
  // =========================================

  private limpiarPdf(): void {


    // =======================================
    // LIBERAR URL TEMPORAL
    // =======================================

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
  // CERRAR MODAL
  // =========================================

  cerrarModal(): void {


    // =======================================
    // LIMPIAR PDF
    // =======================================

    this.limpiarPdf();


    // =======================================
    // LIMPIAR DATOS
    // =======================================

    this.archivoSeleccionado =
      null;

    this.archivos =
      [];

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


    // =======================================
    // AVISAR AL PADRE
    // =======================================

    this.cerrar.emit();

  }

}