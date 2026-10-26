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

import { ExpedienteService } from '../../../../services/expediente.service';

interface InformeQrd3 {
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
    selector: 'app-respuesta-qrd3',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    templateUrl: './respuesta-qrd3.component.html',
    styleUrl: './respuesta-qrd3.component.css'
})
export class RespuestaQrd3Component
    implements OnChanges {

    @Input()
    expediente: any = null;

    @Output()
    cerrar = new EventEmitter<void>();

    @Output()
    enviar = new EventEmitter<any>();

    pestanaActiva = 1;

    informes: InformeQrd3[] = [];

    archivoSeleccionado: File | null = null;

    cargandoInformes = false;
    guardandoInforme = false;

    formulario = {
        nombreDocumento: '',
        tipoDocumento: '',
        origen: 'Inspectoría QRD - Nivel 3',
        destino: 'Inspectoría QRD - Nivel 2',
        fecha: this.fechaActual(),
        descripcion: ''
    };

    constructor(
        private expedienteService: ExpedienteService
    ) { }

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
                    informe: InformeQrd3
                ) =>
                    Math.max(
                        mayor,
                        informe.numero
                    ),
                0
            );

        return ultimo + 1;
    }

    cambiarPestana(numero: number): void {
        this.pestanaActiva = numero;
    }

    seleccionarArchivo(evento: Event): void {
        const input =
            evento.target as HTMLInputElement;

        const archivo =
            input.files?.[0] || null;

        if (!archivo) {
            return;
        }

        const esPdf =
            archivo.type === 'application/pdf' ||
            archivo.name
                .toLowerCase()
                .endsWith('.pdf');

        if (!esPdf) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo no válido',
                text: 'Solo se permite adjuntar archivos PDF.'
            });

            input.value = '';
            this.archivoSeleccionado = null;

            return;
        }

        if (
            archivo.size >
            10 * 1024 * 1024
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo demasiado grande',
                text: 'El PDF no puede superar los 10 MB.'
            });

            input.value = '';
            this.archivoSeleccionado = null;

            return;
        }

        this.archivoSeleccionado = archivo;
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
            nombreDocumento: nombre,
            tipoDocumento: tipo,
            descripcion: descripcion,
            fechaDocumento: this.formulario.fecha
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
                        'ERROR AL GUARDAR RESPUESTA QRD3:',
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
                                    `Inspectoría QRD - Nivel ${respuesta.nivelOrigen || 3
                                    }`,

                                destino:
                                    `Inspectoría QRD - Nivel ${respuesta.nivelDestino || 2
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
                        'ERROR AL CARGAR RESPUESTAS QRD3:',
                        err
                    );

                    this.informes = [];
                    this.cargandoInformes = false;
                }
            });
    }

    eliminarInforme(
        informe: InformeQrd3
    ): void {
        Swal.fire({
            icon: 'warning',
            title: '¿Eliminar informe?',
            text:
                `Se eliminará el informe N° ${informe.numero}.`,
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
                            'ERROR AL ELIMINAR INFORME QRD3:',
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

    verPdf(informe: InformeQrd3): void {
        const idRespuesta =
            Number(
                informe?.idRespuesta
            );

        if (!idRespuesta) {
            Swal.fire({
                icon: 'error',
                title: 'Respuesta no encontrada',
                text: 'El informe no tiene un ID válido.'
            });

            return;
        }

        /*
         * Se abre la pestaña inmediatamente
         * para evitar que el navegador la bloquee.
         */
        const nuevaPestana =
            window.open(
                '',
                '_blank'
            );

        if (!nuevaPestana) {
            Swal.fire({
                icon: 'warning',
                title: 'Ventana bloqueada',
                text: 'Permite las ventanas emergentes del sistema.'
            });

            return;
        }

        nuevaPestana.document.write(`
      <html>
        <head>
          <title>Cargando PDF...</title>
        </head>

        <body
          style="
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          "
        >
          Cargando PDF...
        </body>
      </html>
    `);

        this.expedienteService
            .verPdfRespuestaQrd4(
                idRespuesta
            )
            .subscribe({
                next: (blob: Blob) => {
                    const archivoPdf =
                        new Blob(
                            [blob],
                            {
                                type: 'application/pdf'
                            }
                        );

                    const url =
                        URL.createObjectURL(
                            archivoPdf
                        );

                    nuevaPestana.location.href =
                        url;

                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                    }, 60000);
                },

                error: (err) => {
                    console.error(
                        'ERROR AL ABRIR PDF QRD3:',
                        err
                    );

                    nuevaPestana.close();

                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo abrir el PDF',
                        text:
                            err?.error?.message ||
                            'El servidor no encontró el archivo PDF.'
                    });
                }
            });
    }

    cerrarModal(): void {
        this.cerrar.emit();
    }

    private limpiarFormulario(): void {
        this.formulario = {
            nombreDocumento: '',
            tipoDocumento: '',
            origen: 'Inspectoría QRD - Nivel 3',
            destino: 'Inspectoría QRD - Nivel 2',
            fecha: this.fechaActual(),
            descripcion: ''
        };

        this.archivoSeleccionado = null;
    }

    private fechaActual(): string {
        return new Date()
            .toISOString()
            .slice(0, 10);
    }



    enviarRespuesta(): void {
        if (!this.expediente?.idExpediente) {
            return;
        }

        Swal.fire({
            icon: 'question',
            title: '¿Enviar respuesta a QRD Nivel 2?',
            text: 'El caso pasará a QRD2 para su cierre.',
            showCancelButton: true,
            confirmButtonText: 'SÍ, ENVIAR',
            cancelButtonText: 'CANCELAR',
            confirmButtonColor: '#176b49'
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                this.enviar.emit(this.expediente);
            }
        });
    }
}