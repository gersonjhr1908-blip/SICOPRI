import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IntegridadService {
  private readonly apiIntegridad =
    'http://localhost:8080/backend-sistema/integridad';

  constructor(private http: HttpClient) {}

  // REGISTRAR DENUNCIA

  guardarDenuncia(
    expediente: any,
    datosIntegridad: any,
    archivos: File[],
  ): Observable<any> {
    const formData = new FormData();

    // Se guardan en las columnas PERSONA_*
    // del expediente de Integridad.
    const expedienteConPersona = {
      ...expediente,

      datosPersona: {
        nombres: this.normalizar(datosIntegridad.nombres),
        apellidos: this.normalizar(datosIntegridad.apellidos),
        ruc: this.normalizar(datosIntegridad.ruc),
        dni: this.normalizar(datosIntegridad.dni),
        telefono: this.normalizar(datosIntegridad.telefono),
        domicilio: this.normalizar(datosIntegridad.domicilio),
        correo: this.normalizar(datosIntegridad.correo),
        situacion: this.normalizar(datosIntegridad.situacion),
      },
    };

    const expedienteBlob = new Blob([JSON.stringify(expedienteConPersona)], {
      type: 'application/json',
    });

    formData.append('expediente', expedienteBlob);

    // Campos propios de INT_DENUNCIA.
    const camposIntegridad = [
      'tipoDocumento',
      'dni',
      'correo',
      'telefono',
      'fechaActoCorrupcion',
      'motivoDenuncia',
      'medidaProteccion',
      'identificacion',
      'sexo',
      'detalle',
      'detalleOtros',
    ];

    for (const campo of camposIntegridad) {
      this.agregarSiExiste(formData, campo, datosIntegridad[campo]);
    }

    for (const archivo of archivos || []) {
      formData.append('archivos', archivo, archivo.name);
    }

    return this.http.post<any>(this.apiIntegridad, formData);
  }

  // LISTAR REGISTRADOS

  listarRegistrados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiIntegridad}/registrados`);
  }

  // OBTENER DETALLE

  obtenerDetalle(idExpediente: number): Observable<any> {
    return this.http.get<any>(`${this.apiIntegridad}/${idExpediente}`);
  }

  // EDITAR DENUNCIA
  // Conserva los campos que recibe actualmente
  // el endpoint de edición.

  actualizarDenuncia(idExpediente: number, datos: any): Observable<any> {
    const formData = new FormData();

    const camposEdicion = [
      'nroDocumento',
      'tipoDocumento',
      'dni',
      'correo',
      'telefono',
      'fechaActoCorrupcion',
      'motivoDenuncia',
      'medidaProteccion',
      'identificacion',
      'sexo',
      'detalle',
      'detalleOtros',
    ];

    for (const campo of camposEdicion) {
      this.agregarInclusoVacio(formData, campo, datos[campo]);
    }

    if (datos.datosPersona && 'situacion' in datos.datosPersona) {
      formData.append('situacion', datos.datosPersona.situacion ?? '');
    }

    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}`,
      formData,
    );
  }

  // ELIMINACIÓN LÓGICA

  eliminarDenuncia(idExpediente: number): Observable<void> {
    return this.http.delete<void>(`${this.apiIntegridad}/${idExpediente}`);
  }

  enviarANivel3(idExpediente: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/enviar-nivel-3`,
      {},
    );
  }

  // NORMALIZAR DATOS PERSONALES

  listarRespuestasNivel3(idExpediente: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel3`,
    );
  }

  guardarRespuestaNivel3(
    idExpediente: number,
    respuesta: any,
    archivo: File,
  ): Observable<any> {
    const formData = new FormData();

    formData.append(
      'respuesta',
      new Blob([JSON.stringify(respuesta)], { type: 'application/json' }),
    );

    formData.append('archivo', archivo, archivo.name);

    return this.http.post<any>(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel3`,
      formData,
    );
  }

  verPdfRespuestaNivel3(
    idExpediente: number,
    idRespuesta: number,
  ): Observable<Blob> {
    return this.http.get(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel3/${idRespuesta}/ver`,
      { responseType: 'blob' },
    );
  }

  eliminarInformeEnvio(
    idExpediente: number,
    idInforme: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiIntegridad}/${idExpediente}/informes-envio/${idInforme}`,
    );
  }

  listarInformesEnvio(idExpediente: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiIntegridad}/${idExpediente}/informes-envio`,
    );
  }

  guardarInformeEnvio(
    idExpediente: number,
    informe: any,
    archivo: File,
  ): Observable<any> {
    const formData = new FormData();

    formData.append(
      'informe',
      new Blob([JSON.stringify(informe)], { type: 'application/json' }),
    );

    formData.append('archivo', archivo, archivo.name);

    return this.http.post<any>(
      `${this.apiIntegridad}/${idExpediente}/informes-envio`,
      formData,
    );
  }

  verPdfInformeEnvio(
    idExpediente: number,
    idInforme: number,
  ): Observable<Blob> {
    return this.http.get(
      `${this.apiIntegridad}/${idExpediente}/informes-envio/${idInforme}/ver`,
      { responseType: 'blob' },
    );
  }
  devolverDesdeNivel3(
    idExpediente: number,
    observacion: string,
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/devolver-desde-nivel-3`,
      { observacion },
    );
  }

  enviarANivel4(idExpediente: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/enviar-nivel-4`,
      {},
    );
  }

  enviarRespuestaNivel2(idExpediente: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/enviar-respuesta-nivel-2`,
      {},
    );
  }
  eliminarRespuestaNivel3(
    idExpediente: number,
    idRespuesta: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel3/${idRespuesta}`,
    );
  }

  archivarDenuncia(idExpediente: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/archivar`,
      {},
    );
  }

  eliminarArchivada(idExpediente: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiIntegridad}/${idExpediente}/archivado`,
    );
  }

  listarRespuestasNivel4(idExpediente: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel4`,
    );
  }

  guardarRespuestaNivel4(
    idExpediente: number,
    respuesta: any,
    archivo: File,
  ): Observable<any> {
    const formData = new FormData();

    formData.append(
      'respuesta',
      new Blob([JSON.stringify(respuesta)], { type: 'application/json' }),
    );

    formData.append('archivo', archivo, archivo.name);

    return this.http.post<any>(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel4`,
      formData,
    );
  }

  verPdfRespuestaNivel4(
    idExpediente: number,
    idRespuesta: number,
  ): Observable<Blob> {
    return this.http.get(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel4/${idRespuesta}/ver`,
      { responseType: 'blob' },
    );
  }

  eliminarRespuestaNivel4(
    idExpediente: number,
    idRespuesta: number,
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiIntegridad}/${idExpediente}/respuestas-nivel4/${idRespuesta}`,
    );
  }

  enviarRespuestaDesdeNivel4(idExpediente: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/enviar-respuesta-desde-nivel-4`,
      {},
    );
  }

  devolverDesdeNivel4(
    idExpediente: number,
    observacion: string,
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/devolver-desde-nivel-4`,
      { observacion },
    );
  }

  remitirRespuestaNivel4AlNivel2(idExpediente: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiIntegridad}/${idExpediente}/remitir-respuesta-nivel-2`,
      {},
    );
  }

  private normalizar(valor: unknown): string | null {
    if (valor === null || valor === undefined) {
      return null;
    }

    const texto = String(valor).trim();

    return texto || null;
  }

  // REGISTRO:
  // No envía parámetros vacíos.

  private agregarSiExiste(
    formData: FormData,
    nombre: string,
    valor: unknown,
  ): void {
    if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
      formData.append(nombre, String(valor));
    }
  }

  // EDICIÓN:
  // Conserva el envío de vacíos para borrar campos.

  private agregarInclusoVacio(
    formData: FormData,
    nombre: string,
    valor: unknown,
  ): void {
    formData.append(
      nombre,
      valor === null || valor === undefined ? '' : String(valor),
    );
  }
}
