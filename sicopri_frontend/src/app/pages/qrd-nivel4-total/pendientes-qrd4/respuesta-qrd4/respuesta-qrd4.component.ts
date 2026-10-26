import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';

import {
  ExpedienteService
} from '../../../../services/expediente.service';


interface InformeQrd4 {
  idRespuesta: number;
  numero: number;
  nombreDocumento: string;
  tipoDocumento: string;
  origen: string;
  destino: string;
  fecha: string;
  descripcion: string;
  nombreArchivo: string;
}


@Component({
  selector: 'app-respuesta-qrd4',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './respuesta-qrd4.component.html',
  styleUrl: './respuesta-qrd4.component.css'
})
export class RespuestaQrd4Component
  implements OnChanges {

  @Input()
  expediente: any = null;

  @Output()
  cerrar = new EventEmitter<void>();


  pestanaActiva: number = 1;

  informes: InformeQrd4[] = [];

  archivoSeleccionado: File | null = null;

  cargandoInformes: boolean = false;

  guardandoInforme: boolean = false;


  formulario = {
    nombreDocumento: '',
    tipoDocumento: '',
    origen: 'Inspectoría QRD - Nivel 4',
    destino: 'Inspectoría QRD - Nivel 2',
    fecha: this.fechaActual(),
    descripcion: ''
  };


  constructor(
    private expedienteService:
      ExpedienteService
  ) {}


  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['expediente'] &&
      this.expediente
    ) {

      this.limpiarFormulario();

      this.pestanaActiva = 1;

      this.cargarInformes();

    }

  }


  get siguienteNumero(): number {

    const ultimo =
      this.informes.reduce(
        (
          mayor: number,
          informe: InformeQrd4
        ) => Math.max(
          mayor,
          informe.numero
        ),
        0
      );

    return ultimo + 1;

  }


  cambiarPestana(
    numero: number
  ): void {

    this.pestanaActiva = numero;

  }


  seleccionarArchivo(
    evento: Event
  ): void {

    const input =
      evento.target as HTMLInputElement;

    const archivo =
      input.files?.[0] || null;

    if (!archivo) {
      return;
    }

    if (
      archivo.type !==
      'application/pdf'
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Archivo no válido',
        text: 'Solo se permite adjuntar archivos PDF.'
      });

      input.value = '';

      return;
    }

    this.archivoSeleccionado =
      archivo;

  }


  guardarInforme(): void {

    const idExpediente =
      Number(
        this.expediente?.idExpediente
      );

    const nombre =
      this.formulario
        .nombreDocumento
        .trim();

    const tipo =
      this.formulario
        .tipoDocumento
        .trim();

    const descripcion =
      this.formulario
        .descripcion
        .trim();


    if (!idExpediente) {

      Swal.fire({
        icon: 'error',
        title: 'Expediente no encontrado',
        text: 'No se encontró el identificador del expediente.'
      });

      return;

    }


    if (
      !nombre ||
      !tipo ||
      !this.formulario.fecha ||
      !descripcion
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Complete los datos',
        text: 'Nombre, tipo, fecha y descripción son obligatorios.'
      });

      return;

    }


    if (!this.archivoSeleccionado) {

      Swal.fire({
        icon: 'warning',
        title: 'Adjunte el PDF',
        text: 'Debe adjuntar un PDF para guardar el informe.'
      });

      return;

    }


    this.guardandoInforme = true;


    const respuesta = {

      nombreDocumento:
        nombre,

      tipoDocumento:
        tipo,

      descripcion:
        descripcion,

      fechaDocumento:
        this.formulario.fecha

    };


    this.expedienteService
      .guardarRespuestaQrd4(

        idExpediente,

        respuesta,

        this.archivoSeleccionado

      )
      .subscribe({

        next: () => {

          this.guardandoInforme = false;

          this.cargarInformes();

          Swal.fire({
            icon: 'success',
            title: 'Informe guardado correctamente',
            text: 'El informe y su PDF fueron registrados.',
            confirmButtonText: 'ACEPTAR',
            confirmButtonColor: '#176b49'
          }).then(() => {

            this.limpiarFormulario();

            this.pestanaActiva = 2;

          });

        },

        error: (err) => {

          console.error(
            'ERROR AL GUARDAR RESPUESTA QRD4:',
            err
          );

          this.guardandoInforme = false;

          Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar el informe',
            text:
              err?.error?.message ||
              err?.error?.mensaje ||
              'Ocurrió un error al registrar el informe.'
          });

        }

      });

  }


  cargarInformes(): void {

    const idExpediente =
      Number(
        this.expediente?.idExpediente
      );

    if (!idExpediente) {

      this.informes = [];

      return;

    }


    this.cargandoInformes = true;


    this.expedienteService
      .listarRespuestasQrd4(
        idExpediente
      )
      .subscribe({

        next: (data: any[]) => {

          this.informes =
            (data || []).map(
              (respuesta: any) => ({

                idRespuesta:
                  Number(
                    respuesta.idRespuesta
                  ),

                numero:
                  Number(
                    respuesta.numeroInforme
                  ),

                nombreDocumento:
                  respuesta.nombreDocumento ||
                  '-',

                tipoDocumento:
                  respuesta.tipoDocumento ||
                  '-',

                origen:
                  `Inspectoría QRD - Nivel ${
                    respuesta.nivelOrigen || 4
                  }`,

                destino:
                  `Inspectoría QRD - Nivel ${
                    respuesta.nivelDestino || 2
                  }`,

                fecha:
                  String(
                    respuesta.fechaDocumento || ''
                  ).substring(0, 10),

                descripcion:
                  respuesta.descripcion ||
                  '',

                nombreArchivo:
                  respuesta.nombreArchivo ||
                  'Documento PDF'

              })
            );

          this.cargandoInformes = false;

        },

        error: (err) => {

          console.error(
            'ERROR AL CARGAR RESPUESTAS QRD4:',
            err
          );

          this.informes = [];

          this.cargandoInformes = false;

        }

      });

  }


  eliminarInforme(
    informe: InformeQrd4
  ): void {

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar informe?',
      text: `Se eliminará el informe N° ${informe.numero}.`,
      showCancelButton: true,
      confirmButtonText: 'SÍ, ELIMINAR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#b42318'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.expedienteService
        .eliminarRespuestaQrd4(
          informe.idRespuesta
        )
        .subscribe({

          next: () => {

            this.cargarInformes();

            Swal.fire({
              icon: 'success',
              title: 'Informe eliminado',
              text: 'El informe fue eliminado correctamente.'
            });

          },

          error: (err) => {

            console.error(
              'ERROR AL ELIMINAR INFORME QRD4:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'No se pudo eliminar',
              text:
                err?.error?.message ||
                'No se pudo eliminar el informe.'
            });

          }

        });

    });

  }


  verPdf(
    informe: InformeQrd4
  ): void {

    this.expedienteService
      .verPdfRespuestaQrd4(
        informe.idRespuesta
      )
      .subscribe({

        next: (blob: Blob) => {

          const url =
            URL.createObjectURL(
              new Blob(
                [blob],
                {
                  type: 'application/pdf'
                }
              )
            );

          window.open(
            url,
            '_blank'
          );

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 30000);

        },

        error: (err) => {

          console.error(
            'ERROR AL ABRIR PDF DE RESPUESTA:',
            err
          );

          Swal.fire({
            icon: 'error',
            title: 'No se pudo abrir el PDF',
            text: 'El archivo no está disponible.'
          });

        }

      });

  }


  cerrarModal(): void {

    this.cerrar.emit();

  }


  private limpiarFormulario(): void {

    this.formulario = {

      nombreDocumento:
        '',

      tipoDocumento:
        '',

      origen:
        'Inspectoría QRD - Nivel 4',

      destino:
        'Inspectoría QRD - Nivel 2',

      fecha:
        this.fechaActual(),

      descripcion:
        ''

    };

    this.archivoSeleccionado =
      null;

  }


  private fechaActual(): string {

    return new Date()
      .toISOString()
      .slice(0, 10);

  }

}