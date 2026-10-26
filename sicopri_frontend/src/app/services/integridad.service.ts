import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class IntegridadService {


  // =========================================
  // API
  // =========================================

  private apiIntegridad =
    'http://localhost:8080/backend-sistema/integridad';


  constructor(
    private http: HttpClient
  ) { }


  // =========================================
  // GUARDAR DENUNCIA
  // =========================================

  guardarDenuncia(
    expediente: any,
    datosIntegridad: any,
    archivos: File[]
  ): Observable<any> {


    const formData =
      new FormData();


    const expedienteBlob =
      new Blob(

        [
          JSON.stringify(
            expediente
          )
        ],

        {
          type:
            'application/json'
        }

      );


    formData.append(
      'expediente',
      expedienteBlob
    );


    this.agregarSiExiste(
      formData,
      'tipoDocumento',
      datosIntegridad.tipoDocumento
    );


    this.agregarSiExiste(
      formData,
      'dni',
      datosIntegridad.dni
    );


    this.agregarSiExiste(
      formData,
      'correo',
      datosIntegridad.correo
    );


    this.agregarSiExiste(
      formData,
      'telefono',
      datosIntegridad.telefono
    );


    this.agregarSiExiste(
      formData,
      'fechaActoCorrupcion',
      datosIntegridad.fechaActoCorrupcion
    );


    this.agregarSiExiste(
      formData,
      'motivoDenuncia',
      datosIntegridad.motivoDenuncia
    );


    this.agregarSiExiste(
      formData,
      'medidaProteccion',
      datosIntegridad.medidaProteccion
    );


    this.agregarSiExiste(
      formData,
      'identificacion',
      datosIntegridad.identificacion
    );


    this.agregarSiExiste(
      formData,
      'sexo',
      datosIntegridad.sexo
    );


    this.agregarSiExiste(
      formData,
      'detalle',
      datosIntegridad.detalle
    );


    this.agregarSiExiste(
      formData,
      'detalleOtros',
      datosIntegridad.detalleOtros
    );


    archivos.forEach(
      (
        archivo: File
      ) => {

        formData.append(
          'archivos',
          archivo
        );

      }
    );


    return this.http.post<any>(
      this.apiIntegridad,
      formData
    );

  }


  // =========================================
  // LISTAR REGISTRADOS
  // =========================================

  listarRegistrados():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiIntegridad}/registrados`
    );

  }


  // =========================================
  // OBTENER DETALLE
  // =========================================

  obtenerDetalle(
    idExpediente: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiIntegridad}/${idExpediente}`
    );

  }


  // =========================================
  // EDITAR DENUNCIA
  //
  // PUT /integridad/{id}
  // =========================================

  actualizarDenuncia(
    idExpediente: number,
    datos: any
  ): Observable<any> {


    const formData =
      new FormData();


    // =======================================
    // AQUÍ SÍ ENVIAMOS VACÍOS
    //
    // porque si el usuario borra un dato,
    // también debe quedar borrado en Oracle.
    // =======================================

    this.agregarInclusoVacio(
      formData,
      'nroDocumento',
      datos.nroDocumento
    );


    this.agregarInclusoVacio(
      formData,
      'tipoDocumento',
      datos.tipoDocumento
    );


    this.agregarInclusoVacio(
      formData,
      'dni',
      datos.dni
    );


    this.agregarInclusoVacio(
      formData,
      'correo',
      datos.correo
    );


    this.agregarInclusoVacio(
      formData,
      'telefono',
      datos.telefono
    );


    this.agregarInclusoVacio(
      formData,
      'fechaActoCorrupcion',
      datos.fechaActoCorrupcion
    );


    this.agregarInclusoVacio(
      formData,
      'motivoDenuncia',
      datos.motivoDenuncia
    );


    this.agregarInclusoVacio(
      formData,
      'medidaProteccion',
      datos.medidaProteccion
    );


    this.agregarInclusoVacio(
      formData,
      'identificacion',
      datos.identificacion
    );


    this.agregarInclusoVacio(
      formData,
      'sexo',
      datos.sexo
    );


    this.agregarInclusoVacio(
      formData,
      'detalle',
      datos.detalle
    );


    this.agregarInclusoVacio(
      formData,
      'detalleOtros',
      datos.detalleOtros
    );


    return this.http.put<any>(

      `${this.apiIntegridad}/${idExpediente}`,

      formData

    );

  }


  // =========================================
  // ELIMINACIÓN LÓGICA
  //
  // DELETE /integridad/{id}
  // =========================================

  eliminarDenuncia(
    idExpediente: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiIntegridad}/${idExpediente}`
    );

  }


  // =========================================
  // HELPER REGISTRO
  // =========================================

  private agregarSiExiste(
    formData: FormData,
    nombre: string,
    valor: any
  ): void {

    if (
      valor !== null &&
      valor !== undefined &&
      String(valor).trim() !== ''
    ) {

      formData.append(
        nombre,
        String(valor)
      );

    }

  }


  // =========================================
  // HELPER EDICIÓN
  // =========================================

  private agregarInclusoVacio(
    formData: FormData,
    nombre: string,
    valor: any
  ): void {

    formData.append(

      nombre,

      valor === null ||
      valor === undefined
        ? ''
        : String(valor)

    );

  }

}