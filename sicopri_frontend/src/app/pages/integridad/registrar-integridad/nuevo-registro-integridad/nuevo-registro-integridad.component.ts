import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  IntegridadService
} from '../../../../services/integridad.service';


@Component({
  selector: 'app-nuevo-registro-integridad',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './nuevo-registro-integridad.component.html',

  styleUrl:
    './nuevo-registro-integridad.component.css'
})
export class NuevoRegistroIntegridadComponent {


  // =========================================
  // AVISAR AL COMPONENTE PADRE
  // =========================================

  @Output()
  guardado =
    new EventEmitter<any>();


  // =========================================
  // DATOS PRINCIPALES
  // =========================================

  tipoDocumento: string | null = null;

  dni: string = '';

  codigo: string = '';

  fechaRegistro: string = '';

  correo: string = '';

  telefono: string = '';

  fechaActoCorrupcion: string = '';


  // =========================================
  // DENUNCIA
  // =========================================

  motivoDenuncia: string | null = null;

  medidaProteccion: string | null = null;


  // =========================================
  // DENUNCIANTE
  // =========================================

  identificacion: string | null = null;

  sexo: string | null = null;

  detalle: string = '';

  detalleOtros: string = '';


  // =========================================
  // PDFs
  // =========================================

  archivos: File[] = [];

  maxArchivos: number = 5;

  maxTamanoPdf: number =
    10 * 1024 * 1024;


  // =========================================
  // CONTROL GUARDADO
  // =========================================

  guardando: boolean = false;


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private integridadService:
      IntegridadService

  ) { }


  // =========================================
  // SELECCIONAR PDFs
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


    const pdfValidos =
      seleccionados.filter(
        (archivo: File) => {


          const esPdf =
            archivo.type ===
              'application/pdf'
            ||
            archivo.name
              .toLowerCase()
              .endsWith('.pdf');


          if (!esPdf) {

            alert(
              `El archivo "${archivo.name}" no es PDF.`
            );

            return false;

          }


          if (
            archivo.size >
            this.maxTamanoPdf
          ) {

            alert(
              `El archivo "${archivo.name}" supera los 10 MB.`
            );

            return false;

          }


          return true;

        }
      );


    const nuevos =
      pdfValidos.filter(
        (archivo: File) =>

          !this.archivos.some(
            (existente: File) =>

              existente.name ===
              archivo.name

              &&

              existente.size ===
              archivo.size
          )

      );


    if (
      this.archivos.length +
      nuevos.length >
      this.maxArchivos
    ) {

      alert(
        `Solo se permiten máximo ${this.maxArchivos} archivos PDF.`
      );

      input.value = '';

      return;

    }


    this.archivos = [
      ...this.archivos,
      ...nuevos
    ];


    input.value = '';

  }


  // =========================================
  // ELIMINAR PDF
  // =========================================

  eliminarArchivo(
    index: number
  ): void {

    this.archivos.splice(
      index,
      1
    );


    this.archivos = [
      ...this.archivos
    ];

  }


  // =========================================
  // TAMAÑO PDF
  // =========================================

  obtenerTamanoArchivo(
    bytes: number
  ): string {


    if (
      bytes < 1024
    ) {

      return `${bytes} B`;

    }


    if (
      bytes <
      1024 * 1024
    ) {

      return (
        bytes / 1024
      ).toFixed(1) + ' KB';

    }


    return (
      bytes /
      (1024 * 1024)
    ).toFixed(1) + ' MB';

  }


  // =========================================
  // GUARDAR
  // =========================================

  guardar(): void {


    if (!this.fechaActoCorrupcion) {

      alert(
        'Debe ingresar la fecha del acto de corrupción.'
      );

      return;

    }


    if (!this.motivoDenuncia) {

      alert(
        'Debe seleccionar el motivo de la denuncia.'
      );

      return;

    }


    if (this.guardando) {

      return;

    }


    // =======================================
    // EXPEDIENTE GENERAL
    //
    // YA NO ENVÍA:
    // NÚCLEO
    // BRIGADA
    // UNIDAD
    // =======================================

    const expediente = {

      categoria:
        'INTEGRIDAD',

      nroDocumento:
        this.codigo || null,

      descripcion:
        this.detalle || null

    };


    // =======================================
    // DATOS PROPIOS DE INTEGRIDAD
    // =======================================

    const datosIntegridad = {

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


    this.guardando =
      true;


    this.integridadService
      .guardarDenuncia(

        expediente,

        datosIntegridad,

        this.archivos

      )
      .subscribe({


        next: (
          respuesta
        ) => {


          this.guardando =
            false;


          console.log(
            'DENUNCIA INTEGRIDAD GUARDADA:',
            respuesta
          );


          this.limpiarFormulario();


          this.guardado.emit(
            respuesta
          );

        },


        error: (
          error
        ) => {


          this.guardando =
            false;


          console.error(
            'ERROR AL GUARDAR DENUNCIA DE INTEGRIDAD:',
            error
          );


          let mensaje =
            'No se pudo registrar la denuncia.';


          if (
            error?.error?.message
          ) {

            mensaje =
              error.error.message;

          }

          else if (
            typeof error?.error ===
            'string'
          ) {

            mensaje =
              error.error;

          }


          alert(
            mensaje
          );

        }

      });

  }


  // =========================================
  // LIMPIAR FORMULARIO
  // =========================================

  limpiarFormulario(): void {

    this.tipoDocumento =
      null;

    this.dni =
      '';

    this.codigo =
      '';

    this.fechaRegistro =
      '';

    this.correo =
      '';

    this.telefono =
      '';

    this.fechaActoCorrupcion =
      '';

    this.motivoDenuncia =
      null;

    this.medidaProteccion =
      null;

    this.identificacion =
      null;

    this.sexo =
      null;

    this.detalle =
      '';

    this.detalleOtros =
      '';

    this.archivos =
      [];

  }

}