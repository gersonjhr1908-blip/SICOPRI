import { CommonModule } from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ExpedienteService
} from '../../../services/expediente.service';


@Component({
  selector: 'app-pendientes-integridad',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './pendientes-integridad.component.html',

  styleUrl:
    './pendientes-integridad.component.css'
})
export class PendientesIntegridadComponent
  implements OnInit {


  search: string = '';


  documentos: any[] = [];

  documentosOriginales: any[] = [];


  constructor(
    private expedienteService:
      ExpedienteService
  ) {}


  ngOnInit(): void {

    this.cargarDocumentos();

  }


  // =========================================
  // CARGAR PENDIENTES INTEGRIDAD NIVEL 3
  // =========================================

  cargarDocumentos(): void {

    this.expedienteService
      .listarExpedientes()
      .subscribe({

        next: (data) => {

          const expedientes =
            data || [];


          const enviadosIntegridad =
            expedientes.filter(
              (exp: any) => {

                const activo =
                  String(
                    exp.activo || ''
                  )
                    .trim()
                    .toUpperCase();


                const categoria =
                  String(
                    exp.categoria || ''
                  )
                    .trim()
                    .toUpperCase();


                return (

                  activo === 'S'

                  &&

                  categoria === 'INTEGRIDAD'

                  &&

                  Number(
                    exp.idEstado
                  ) === 2

                  &&

                  Number(
                    exp.nivelActual
                  ) === 3

                );

              }
            );


          this.documentosOriginales =
            enviadosIntegridad.map(
              (exp: any) => {

                return {

                  ...exp,

                  estado:
                    'ENVIADO'

                };

              }
            );


          this.documentos = [
            ...this.documentosOriginales
          ];

        },


        error: (err) => {

          console.error(
            'ERROR AL LISTAR PENDIENTES DE INTEGRIDAD:',
            err
          );

          this.documentos = [];

          this.documentosOriginales = [];

        }

      });

  }


  // =========================================
  // BUSCAR
  // =========================================

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
              .includes(texto)

            ||

            String(
              doc.nroDocumento || ''
            )
              .toLowerCase()
              .includes(texto)

            ||

            String(
              doc.asunto || ''
            )
              .toLowerCase()
              .includes(texto)

          );

        }
      );

  }


  // =========================================
  // LIMPIAR
  // =========================================

  limpiarBusqueda(): void {

    this.search = '';

    this.documentos = [
      ...this.documentosOriginales
    ];

  }

}