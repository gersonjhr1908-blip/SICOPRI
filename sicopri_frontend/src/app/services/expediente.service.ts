import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {


  // =========================================
  // URL CATÁLOGOS
  // =========================================

  private apiUrl =
    'http://localhost:8080/backend-sistema/expediente';


  // =========================================
  // URL EXPEDIENTES
  // =========================================

  private apiExpedientes =
    'http://localhost:8080/backend-sistema/expedientes';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private http: HttpClient
  ) { }


  // =========================================
  // TIPOS DE EXPEDIENTE
  // DENUNCIA / QUEJA / RECLAMO
  // =========================================

  getTiposExpediente():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/catalogos/tipos-expediente`
    );

  }


  // =========================================
  // TIPOS DE DOCUMENTO
  // =========================================

  getTiposDocumento():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/catalogos/tipos-documento`
    );

  }


  // =========================================
  // ESTADOS INTERNOS
  // =========================================

  getEstadosExpediente():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/catalogos/estados`
    );

  }


  // =========================================
  // SITUACIONES GENERALES
  // =========================================

  getSituaciones():
    Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/catalogos/situaciones`
    );

  }


  // =========================================
  // TIPIFICACIONES POR SECCIÓN
  // =========================================

  getTipificaciones(
    idTipoExpediente: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/catalogos/tipificaciones/${idTipoExpediente}`
    );

  }


  // =========================================
  // GUARDAR EXPEDIENTE + PDFs
  // =========================================

  guardarExpediente(
    expediente: any,
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


    archivos.forEach(
      archivo => {

        formData.append(
          'archivos',
          archivo
        );

      }
    );


    return this.http.post<any>(
      this.apiExpedientes,
      formData
    );

  }


  // =========================================
  // LISTAR EXPEDIENTES
  // =========================================

  listarExpedientes():
    Observable<any[]> {

    return this.http.get<any[]>(
      this.apiExpedientes
    );

  }


  // =========================================
  // ACTUALIZAR EXPEDIENTE COMPLETO
  // =========================================

  actualizarExpediente(
    idExpediente: number,
    expediente: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}`,
      expediente
    );

  }


  // =========================================
  // ACTUALIZAR SOLO OBSERVACIÓN
  //
  // IMPORTANTE:
  // NO utiliza actualizarExpediente().
  // Por eso NO valida Núcleo / Brigada / Unidad.
  // =========================================

  actualizarObservacion(
    idExpediente: number,
    observacion: string
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/observacion`,
      {
        observacion:
          observacion || ''
      }
    );

  }


  // =========================================
  // ELIMINAR EXPEDIENTE
  // =========================================

  eliminarExpediente(
    idExpediente: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiExpedientes}/${idExpediente}`
    );

  }


  // =========================================
  // QRD3 -> QRD2
  // =========================================

  enviarANivel2(
    idExpediente: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/enviar-nivel-2`,
      {}
    );

  }


  // =========================================
  // QRD2 -> QRD3
  // QRD4 -> QRD3
  // =========================================

  enviarANivel3(
    idExpediente: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/enviar-nivel-3`,
      {}
    );

  }


  // =========================================
  // QRD3 -> QRD4
  // =========================================

  enviarANivel4(
    idExpediente: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/enviar-nivel-4`,
      {}
    );

  }


  // =========================================
  // TRAZABILIDAD
  // =========================================

  listarMovimientos(
    idExpediente: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiExpedientes}/${idExpediente}/movimientos`
    );

  }


  // =========================================
  // GUARDAR SEGUIMIENTO
  //
  // POST
  // /expedientes/{id}/seguimiento
  // =========================================

  guardarSeguimiento(
    idExpediente: number,
    fechaInicio: string,
    fechaFin: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.apiExpedientes}/${idExpediente}/seguimiento`,
      {
        fechaInicio:
          fechaInicio,

        fechaFin:
          fechaFin
      }
    );

  }


  // =========================================
  // OBTENER SEGUIMIENTO
  //
  // GET
  // /expedientes/{id}/seguimiento
  //
  // Sirve para:
  // - volver a abrir Ver Caso
  // - QRD2
  // - QRD3
  // - QRD4
  // =========================================

  obtenerSeguimiento(
    idExpediente: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiExpedientes}/${idExpediente}/seguimiento`
    );

  }


  // =========================================
  // ACTUALIZAR SEGUIMIENTO
  //
  // PUT
  // /expedientes/{id}/seguimiento
  // =========================================

  actualizarSeguimiento(
    idExpediente: number,
    fechaInicio: string,
    fechaFin: string
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/seguimiento`,
      {
        fechaInicio:
          fechaInicio,

        fechaFin:
          fechaFin
      }
    );

  }


  // =========================================
  // LISTAR PDFs DEL EXPEDIENTE
  // =========================================

  listarArchivosExpediente(
    idExpediente: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiExpedientes}/${idExpediente}/archivos`
    );

  }


  // =========================================
  // OBTENER PDF COMO BLOB
  // =========================================

  verArchivo(
    idArchivo: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiExpedientes}/archivos/${idArchivo}/ver`,
      {
        responseType: 'blob'
      }
    );

  }


  // =========================================
  // AGREGAR PDFs A EXPEDIENTE EXISTENTE
  // =========================================

  agregarArchivosExpediente(
    idExpediente: number,
    cinv: string,
    archivos: File[]
  ): Observable<any[]> {

    const formData =
      new FormData();


    formData.append(
      'cinv',
      cinv
    );


    archivos.forEach(
      (archivo: File) => {

        formData.append(
          'archivos',
          archivo
        );

      }
    );


    return this.http.post<any[]>(
      `${this.apiExpedientes}/${idExpediente}/archivos`,
      formData
    );

  }


  // =========================================
  // ELIMINAR PDF
  // =========================================

  eliminarArchivoExpediente(
    idArchivo: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiExpedientes}/archivos/${idArchivo}`
    );

  }

  actualizarDestino(
    idExpediente: number,
    nivelDestino: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/destino`,
      {
        nivelDestino: nivelDestino
      }
    );

  }

  // =========================================
  // GUARDAR RESPUESTA QRD4 + UN PDF
  //
  // POST:
  // /expedientes/{id}/respuestas
  // =========================================

  guardarRespuestaQrd4(
    idExpediente: number,
    respuesta: any,
    archivo: File
  ): Observable<any> {

    const formData =
      new FormData();

    const respuestaBlob =
      new Blob(
        [
          JSON.stringify(
            respuesta
          )
        ],
        {
          type:
            'application/json'
        }
      );

    formData.append(
      'respuesta',
      respuestaBlob
    );

    formData.append(
      'archivo',
      archivo
    );

    return this.http.post<any>(
      `${this.apiExpedientes}/${idExpediente}/respuestas`,
      formData
    );
  }


  // =========================================
  // LISTAR RESPUESTAS DEL EXPEDIENTE
  // =========================================

  listarRespuestasQrd4(
    idExpediente: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiExpedientes}/${idExpediente}/respuestas`
    );
  }


  // =========================================
  // VER PDF DE UNA RESPUESTA
  // =========================================

  verPdfRespuestaQrd4(
    idRespuesta: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiExpedientes}/respuestas/${idRespuesta}/ver`,
      {
        responseType: 'blob'
      }
    );
  }


  // =========================================
  // ELIMINAR RESPUESTA
  // =========================================

  eliminarRespuestaQrd4(
    idRespuesta: number
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiExpedientes}/respuestas/${idRespuesta}`
    );
  }

  // =========================================
  // QRD4 -> QRD3
  // ENVÍA RESPUESTA NORMAL
  // =========================================

  enviarRespuestaANivel3(
    idExpediente: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/enviar-respuesta-nivel-3`,
      {}
    );
  }


  // =========================================
  // QRD4 -> QRD3
  // DEVOLVER DOCUMENTO POR CORRECCIÓN
  // =========================================

  devolverDocumentoANivel3(
    idExpediente: number,
    observacion: string
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/devolver-nivel-3`,
      {
        observacion: observacion
      }
    );
  }

  enviarRespuestaANivel2(
    idExpediente: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/enviar-respuesta-nivel-2`,
      {}
    );

  }


  archivarExpediente(
    idExpediente: number
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/archivar`,
      {}
    );

  }

  devolverDesdeNivel3(
    idExpediente: number,
    observacion: string
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiExpedientes}/${idExpediente}/devolver-desde-nivel-3`,
      { observacion }
    );
  }

}

