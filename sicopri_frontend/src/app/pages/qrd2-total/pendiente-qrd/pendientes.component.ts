import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ExpedienteService } from '../../../services/expediente.service';
import { GestionarCasoQrdComponent } from './gestionar-caso-qrd/gestionar-caso-qrd.component';
import { EditarDocumentoQrdComponent } from './editar-documento-qrd/editar-documento-qrd.component';

@Component({
  selector: 'app-pendientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GestionarCasoQrdComponent,
    EditarDocumentoQrdComponent
  ],
  templateUrl: './pendientes.component.html',
  styleUrl: './pendientes.component.css'
})
export class PendientesComponent implements OnInit {

  search = '';

  documentos: any[] = [];
  documentosOriginales: any[] = [];

  tiposDocumento: any[] = [];

  mostrarVerCaso = false;
  documentoSeleccionado: any = null;

  mostrarEditar = false;
  documentoEditar: any = null;

  menuAbiertoId: number | null = null;

  constructor(
    private expedienteService: ExpedienteService
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.expedienteService
      .getTiposDocumento()
      .subscribe({
        next: (data) => {
          this.tiposDocumento = data || [];
          this.cargarDocumentos();
        },
        error: (err) => {
          console.error('ERROR TIPOS DOCUMENTO:', err);
          this.tiposDocumento = [];
          this.cargarDocumentos();
        }
      });
  }

  cargarDocumentos(): void {
    this.expedienteService
      .listarExpedientes()
      .subscribe({
        next: (data) => {
          const expedientes = data || [];

          const recibidos = expedientes.filter(
            (exp: any) => {
              const activo = String(
                exp.activo || ''
              )
                .trim()
                .toUpperCase();

              const categoria = String(
                exp.categoria || ''
              )
                .trim()
                .toUpperCase();

              const tipo = Number(
                exp.idTipoExpediente
              );

              const estado = Number(
                exp.idEstado
              );

              const nivelActual = Number(
                exp.nivelActual
              );

              return (
                activo === 'S' &&
                categoria !== 'INTEGRIDAD' &&
                [1, 2, 3].includes(tipo) &&
                nivelActual === 2 &&
                [2, 3, 4].includes(estado)
              );
            }
          );

          this.documentosOriginales =
            recibidos.map(
              (exp: any) => {
                const estado =
                  Number(exp.idEstado);

                let estadoVisual =
                  'PENDIENTE';

                if (estado === 3) {
                  estadoVisual = 'OBSERVADO';
                }

                if (estado === 4) {
                  estadoVisual = 'CONCLUIDO';
                }

                return {
                  ...exp,

                  categoriaQrd:
                    this.obtenerCategoriaQrd(
                      exp.idTipoExpediente
                    ),

                  documento:
                    this.obtenerTipoDocumento(exp),

                  origenVisual:
                    this.obtenerOrigen(
                      exp.nivelCreacion
                    ),

                  estado: estadoVisual,

                  estadoVisual
                };
              }
            );

          this.documentos = [
            ...this.documentosOriginales
          ];

          console.log(
            'QRD2 - DOCUMENTOS RECIBIDOS:',
            this.documentos
          );
        },

        error: (err) => {
          console.error(
            'ERROR AL LISTAR PENDIENTES QRD2:',
            err
          );

          this.documentos = [];
          this.documentosOriginales = [];
        }
      });
  }

  obtenerCategoriaQrd(
    idTipoExpediente: number
  ): string {
    switch (Number(idTipoExpediente)) {
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

  obtenerTipoDocumento(
    exp: any
  ): string {
    const encontrado =
      this.tiposDocumento.find(
        (tipo: any) =>
          Number(
            tipo.idTipoDocumento
          ) ===
          Number(
            exp.idTipoDocumento
          )
      );

    if (!encontrado) {
      return '-';
    }

    const nombre = String(
      encontrado.nombre || ''
    ).trim();

    if (
      nombre.toUpperCase() ===
      'OTROS'
    ) {
      return String(
        exp.otroTipoDocumento ||
        'OTROS'
      );
    }

    return nombre;
  }

  obtenerOrigen(
    nivelCreacion: number
  ): string {
    switch (Number(nivelCreacion)) {
      case 2:
        return 'QRD NIVEL 2';

      case 3:
        return 'QRD NIVEL 3';

      case 4:
        return 'QRD NIVEL 4';

      default:
        return '-';
    }
  }

  verCaso(
    documento: any
  ): void {
    if (!documento) {
      return;
    }

    this.documentoSeleccionado =
      documento;

    this.mostrarVerCaso =
      true;
  }

  cerrarVerCaso(): void {
    this.mostrarVerCaso =
      false;

    this.documentoSeleccionado =
      null;

    this.cargarDocumentos();
  }

  enviarNivel3(
    expediente: any
  ): void {
    if (!expediente?.idExpediente) {
      return;
    }

    this.expedienteService
      .enviarANivel3(
        expediente.idExpediente
      )
      .subscribe({
        next: () => {
          this.cerrarVerCaso();

          Swal.fire({
            icon: 'success',
            title: 'Expediente enviado',
            text:
              'El expediente fue enviado a Inspectoría QRD Nivel 3.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#176b49'
          });
        },

        error: (err: any) => {
          console.error(
            'ERROR AL ENVIAR QRD2 A QRD3:',
            err
          );

          Swal.fire({
            icon: 'error',
            title:
              'No se pudo enviar el expediente',
            text:
              err?.error?.message ||
              err?.error?.mensaje ||
              'Ocurrió un error al enviar a QRD Nivel 3.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#176b49'
          });
        }
      });
  }

  esConcluido(
    documento: any
  ): boolean {
    return Number(
      documento?.idEstado
    ) === 4;
  }

  toggleMenu(
    documento: any,
    evento: Event
  ): void {
    evento.stopPropagation();

    const id =
      Number(
        documento?.idExpediente
      );

    this.menuAbiertoId =
      this.menuAbiertoId === id
        ? null
        : id;
  }

  gestionar(
    documento: any
  ): void {
    this.menuAbiertoId = null;
    this.verCaso(documento);
  }

  archivar(
    documento: any
  ): void {
    this.menuAbiertoId = null;

    Swal.fire({
      icon: 'question',
      title: '¿Archivar expediente?',
      text:
        'El expediente pasará al Listado Total con estado ARCHIVADO.',
      showCancelButton: true,
      confirmButtonText: 'SÍ, ARCHIVAR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#176b49'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.expedienteService
        .archivarExpediente(
          Number(
            documento.idExpediente
          )
        )
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Expediente archivado',
              text:
                'Ahora aparece en Listado Total.',
              confirmButtonColor: '#176b49'
            });

            this.cargarDocumentos();
          },

          error: (err: any) => {
            Swal.fire({
              icon: 'error',
              title: 'No se pudo archivar',
              text:
                err?.error?.message ||
                err?.error?.mensaje ||
                'Ocurrió un error al archivar el expediente.'
            });
          }
        });
    });
  }

  buscarDocumentos(): void {
    const texto =
      this.search
        .trim()
        .toLowerCase();

    if (!texto) {
      this.documentos = [
        ...this.documentosOriginales
      ];

      return;
    }

    this.documentos =
      this.documentosOriginales.filter(
        (doc: any) => {
          return (
            String(
              doc.cinv || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.origenVisual || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.categoriaQrd || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.documento || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.nroDocumento || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.nroDocumento || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.asunto || ''
            )
              .toLowerCase()
              .includes(texto) ||

            String(
              doc.estadoVisual || ''
            )
              .toLowerCase()
              .includes(texto)
          );
        }
      );
  }

  limpiarBusqueda(): void {
    this.search = '';

    this.documentos = [
      ...this.documentosOriginales
    ];
  }

editar(documento: any): void {
  console.log('EDITAR PRESIONADO:', documento);

  this.menuAbiertoId = null;
  this.documentoEditar = {
    ...documento
  };
  this.mostrarEditar = true;
}

  eliminar(documento: any): void {
    this.menuAbiertoId = null;

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar documento?',
      text: 'Se eliminará completamente el expediente.',
      showCancelButton: true,
      confirmButtonText: 'SÍ, ELIMINAR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#b42318'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.expedienteService
        .eliminarExpediente(Number(documento.idExpediente))
        .subscribe(() => {
          this.cargarDocumentos();

          Swal.fire({
            icon: 'success',
            title: 'Documento eliminado',
            confirmButtonColor: '#176b49'
          });
        });
    });
  }

  cerrarEditar(): void {
    this.mostrarEditar = false;
    this.documentoEditar = null;
  }

  documentoActualizado(documento: any): void {
    this.mostrarEditar = false;
    this.documentoEditar = null;

    this.cargarDocumentos();

    Swal.fire({
      icon: 'success',
      title: 'Documento actualizado',
      text: 'Los cambios se guardaron correctamente.',
      confirmButtonColor: '#176b49'
    });
  }
}