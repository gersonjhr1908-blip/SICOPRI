import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { User } from '../model/users';
import { Observable, Subject } from 'rxjs';
import { Persona } from '../model/persona';
import { UserSave } from '../model/usesave';
import { Userrs } from '../model/Userrs';
import { Matriz } from '../model/matriz';
import { userdev } from '../model/userdev';

export interface Role {
  idRole: number;
  name: string;
  description: string;
  checked?: boolean;
}

export interface Nucleo {
  idNucleo: string;
  nombre: string;
  acronimo: string;
  estadoRegistro: string;
}

export interface Brigada {
  idBrigada: string;
  nombre: string;
  acronimo: string;
  estadoRegistro: string;
  idNucleo: string;
}

export interface Unidad {
  idUnidad: string;
  nombre: string;
  acronimo: string;
  guarnicion: string;
  estadoRegistro: string;
  idNucleo: string;
  idBrigada: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private url: string =
    `${environment.HOST}/users`;

  private urlrq: string =
    `${environment.HOST}/userdataqr`;

  private userChange:
    Subject<User[]> =
    new Subject<User[]>();

  private messageChange:
    Subject<string> =
    new Subject<string>();

  constructor(
    private http: HttpClient
  ) { }


  // =========================================
  // BUSCAR USUARIO POR CIP
  // =========================================
  getBycip(
    cip: string
  ): Observable<Userrs> {

    return this.http.get<Userrs>(
      `${this.url}/buscarporcip/${cip}`
    );
  }


  // =========================================
  // GUARDAR USUARIO
  // =========================================
  saveUser(
    user: UserSave,
    idsRoles: number[]
  ): Observable<any> {

    const url =
      `${this.url}?idsRoles=${idsRoles.join(',')}`;

    const userToSend = {
      ...user
    };

    return this.http.post(
      url,
      userToSend
    );
  }


  // =========================================
  // GUARDAR MATRIZ
  // =========================================
  saveUsermatriz(
    cuenta: Matriz
  ): Observable<any> {

    const url =
      `${this.url}=${(',')}`;

    const userToSend = {
      ...cuenta
    };

    return this.http.post(
      url,
      userToSend
    );
  }


  // =========================================
  // ACTUALIZAR USUARIO
  // =========================================
  updateUser(
    userId: number,
    user: UserSave,
    roleIds: number[]
  ): Observable<any> {

    return this.http.put<any>(
      `${this.url}/${userId}?idsRoles=${roleIds.join(',')}`,
      user
    );
  }


  // =========================================
  // CAMBIAR ROLES
  // =========================================
  changeRoles(
    username: string,
    rolesIds: number[]
  ): Observable<any> {

    const url =
      `${this.url}/roles/${username}`;

    return this.http.put(
      url,
      rolesIds
    );
  }

  // =========================================
  // CAMBIAR ROL ACTIVO
  // Solo para administrador
  // =========================================
  cambiarRolActivo(
    idRol: number
  ): Observable<any> {

    return this.http.put(
      `${this.url}/active-role/${idRol}`,
      {}
    );
  }


  // =========================================
  // CAMBIAR ESTADO
  // =========================================
  changeEstado(
    id: number
  ): Observable<any> {

    return this.http.put(
      `${this.url}/estado/${id}`,
      {}
    );
  }


  // =========================================
  // ELIMINAR USUARIO
  // =========================================
  eliminarUsuario(
    id: string
  ): Observable<any> {

    return this.http.delete(
      `${this.url}/${id}`
    );
  }


  // =========================================
  // BUSCAR POR USERNAME
  // =========================================
  getByUsername(
    username: string
  ) {

    return this.http.get<User>(
      `${this.url}/${username}`
    );
  }


  // =========================================
  // BUSCAR PERSONA POR CIP
  // PARA REGISTRAR
  // =========================================
  getByCip(
    cip: string
  ): Observable<Persona> {

    return this.http.get<Persona>(
      `${this.url}/cip/${cip}`
    );
  }


  // =========================================
  // LISTADO PAGINADO
  // =========================================
  listPageable(
    s: string,
    page: number,
    pageSize: number
  ): Observable<any> {

    const params =
      new HttpParams()
        .set('s', s)
        .set(
          'page',
          page.toString()
        )
        .set(
          'pageSize',
          pageSize.toString()
        );

    return this.http.get<any>(
      `${this.url}/pageable`,
      { params }
    );
  }


  // =========================================
  // CAMBIOS DE USUARIO
  // =========================================
  setUserChange(
    data: User[]
  ) {

    this.userChange.next(data);
  }


  getUserChange() {

    return this.userChange
      .asObservable();
  }


  setMessageChange(
    data: string
  ) {

    this.messageChange.next(data);
  }


  getMessageChange() {

    return this.messageChange
      .asObservable();
  }


  // =========================================
  // ROLES
  // =========================================
  getRoles():
    Observable<Role[]> {

    return this.http.get<Role[]>(
      `${this.url}/roles`
    );
  }


  getRolesForUser(
    id: string
  ): Observable<Role[]> {

    return this.http.get<Role[]>(
      `${this.url}/roles/${id}`
    );
  }


  // =========================================
  // NÚCLEOS
  // =========================================
  getNucleos():
    Observable<Nucleo[]> {

    return this.http.get<Nucleo[]>(
      `${this.url}/nucleos`
    );
  }


  // =========================================
  // BRIGADAS POR NÚCLEO
  // =========================================
  getBrigadas(
    idNucleo: string
  ): Observable<Brigada[]> {

    return this.http.get<Brigada[]>(
      `${this.url}/brigadas/${idNucleo}`
    );
  }


  // =========================================
  // UNIDADES POR NÚCLEO + BRIGADA
  // =========================================
  getUnidades(
    idNucleo: string,
    idBrigada: string
  ): Observable<Unidad[]> {

    return this.http.get<Unidad[]>(
      `${this.url}/unidades/${idNucleo}/${idBrigada}`
    );
  }


  // =========================================
  // OTROS MÉTODOS ANTIGUOS
  // =========================================
  delete(
    id: number
  ) {

    return this.http.delete(
      `${this.url}/changeestado/${id}`
    );
  }


  findAll():
    Observable<User[]> {

    return this.http.get<User[]>(
      this.url
    );
  }


  usersreportPdf():
    Observable<Blob> {

    return this.http.get(
      `${this.url}/export-pdfUsers`,
      {
        responseType: 'blob'
      }
    );
  }


  usersreportPdfList():
    Observable<Blob> {

    return this.http.get(
      `${this.url}/export-pdf-users-list`,
      {
        responseType: 'blob'
      }
    );
  }


  usersreportPdfNucleos(
    idnucleo: any
  ): Observable<Blob> {

    return this.http.get(
      `${this.url}/export-pdf-nucleo/${idnucleo}`,
      {
        responseType: 'blob'
      }
    );
  }


  resetqrthofa(
    cip: string,
    username: string
  ) {

    return this.http.get<userdev>(
      `${this.urlrq}/update/${cip}/${username}`,
      {}
    );
  }

}