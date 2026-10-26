import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { MenuAssign, ResponseApi, RoleAdmin, RoleRequest } from '../model/role-admin';
import { Role } from './users.service';

@Injectable({ providedIn: 'root' })
export class AdminRolesMenuService {

  private url = `${environment.HOST}/admin-roles-menu`;

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<RoleAdmin[]> {
    return this.http.get<ResponseApi<RoleAdmin[]>>(this.url)
      .pipe(map(r => r.data));
  }

  listarMenusPorRol(roleId: number): Observable<MenuAssign[]> {
    return this.http.get<ResponseApi<MenuAssign[]>>(`${this.url}/${roleId}/menus`)
      .pipe(map(r => r.data));
  }

  actualizarMenusRol(roleId: number, menuIds: number[]): Observable<ResponseApi<null>> {
    return this.http.put<ResponseApi<null>>(`${this.url}/${roleId}/menus`, menuIds);
  }

  crearRol(request: RoleRequest): Observable<Role> {
    return this.http.post<ResponseApi<Role>>(this.url, request)
      .pipe(map(r => r.data));
  }

  actualizarRol(roleId: number, request: RoleRequest): Observable<Role> {
    return this.http.put<ResponseApi<Role>>(`${this.url}/${roleId}`, request)
      .pipe(map(r => r.data));
  }

  eliminarRol(roleId: number): Observable<ResponseApi<null>> {
    return this.http.delete<ResponseApi<null>>(`${this.url}/${roleId}`);
  }
}
