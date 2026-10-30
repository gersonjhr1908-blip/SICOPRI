import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';

import {
  LoginService
} from '../services/login.service';

import {
  MenuService
} from '../services/menu.service';

import {
  UsersService
} from '../services/users.service';

import {
  JwtHelperService
} from '@auth0/angular-jwt';

import {
  environment
} from '../../environments/environment.development';

import {
  map,
  switchMap,
  of
} from 'rxjs';

import {
  Menu
} from '../model/menu';


export const certGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {


  // =====================================================
  // SERVICIOS
  // =====================================================

  const loginService =
    inject(LoginService);

  const menuService =
    inject(MenuService);

  const usersService =
    inject(UsersService);

  const router =
    inject(Router);


  // =====================================================
  // 1. VERIFICAR LOGIN
  // =====================================================

  if (!loginService.isLogged()) {

    loginService.logout();

    return false;
  }


  // =====================================================
  // 2. VERIFICAR TOKEN
  // =====================================================

  const helper =
    new JwtHelperService();


  const token =
    sessionStorage.getItem(
      environment.TOKEN_NAME
    );


  if (
    !token ||
    helper.isTokenExpired(token)
  ) {

    loginService.logout();

    return false;
  }


  // =====================================================
  // 3. OBTENER USUARIO DEL TOKEN
  // =====================================================

  const decodedToken =
    helper.decodeToken(token);


  if (
    !decodedToken ||
    !decodedToken.sub
  ) {

    loginService.logout();

    return false;
  }


  const username =
    decodedToken.sub;


  const url =
    state.url;


  // =====================================================
  // 4. OBTENER ROL ACTIVO
  // =====================================================

  return usersService
    .getByUsername(username)
    .pipe(

      switchMap((usuario: any) => {


        const rolActivo =
          Number(
            usuario?.roleActiveIdRole || 0
          );


        console.log(
          'CERT GUARD - ROL ACTIVO:',
          rolActivo
        );


        console.log(
          'CERT GUARD - URL:',
          url
        );


        // =================================================
        // ROLES DEL SISTEMA
        // =================================================
        //
        // 1 = ADMINISTRADOR
        //
        // INTEGRIDAD
        // 2 = Integridad Nivel 2
        // 4 = Integridad Nivel 3
        // 6 = Integridad Nivel 4
        //
        // QRD
        // 3 = QRD Nivel 2
        // 5 = QRD Nivel 3
        // 7 = QRD Nivel 4
        //
        // =================================================


        const esAdministrador =
          rolActivo === 1;


        const esIntegridadNivel2 =
          rolActivo === 2;

        const esIntegridadNivel3 =
          rolActivo === 4;

        const esIntegridadNivel4 =
          rolActivo === 6;


        const esQrdNivel2 =
          rolActivo === 3;


        const esQrdNivel3 =
          rolActivo === 5;


        const esQrdNivel4 =
          rolActivo === 7;


        // =================================================
        // 5. PROTEGER QRD NIVEL 2
        // =================================================
        //
        // Solo:
        // ROL 3
        // ADMIN
        //
        // =================================================

        if (
          url === '/pages/qrd2' ||
          url.startsWith('/pages/qrd2/')
        ) {

          if (
            !esQrdNivel2 &&
            !esAdministrador
          ) {

            console.warn(
              'ACCESO QRD2 DENEGADO PARA ROL:',
              rolActivo
            );


            return of(
              router.createUrlTree([
                '/pages/not-403'
              ])
            );
          }
        }


        // =================================================
        // 6. PROTEGER QRD NIVEL 3
        // =================================================
        //
        // Solo:
        // ROL 5
        // ADMIN
        //
        // =================================================

        if (
          url === '/pages/qrd3' ||
          url.startsWith('/pages/qrd3/')
        ) {

          if (
            !esQrdNivel3 &&
            !esAdministrador
          ) {

            console.warn(
              'ACCESO QRD3 DENEGADO PARA ROL:',
              rolActivo
            );


            return of(
              router.createUrlTree([
                '/pages/not-403'
              ])
            );
          }
        }


        // =================================================
        // 7. PROTEGER QRD NIVEL 4
        // =================================================
        //
        // Solo:
        // ROL 7
        // ADMIN
        //
        // =================================================

        if (
          url === '/pages/qrd4' ||
          url.startsWith('/pages/qrd4/')
        ) {

          if (
            !esQrdNivel4 &&
            !esAdministrador
          ) {

            console.warn(
              'ACCESO QRD4 DENEGADO PARA ROL:',
              rolActivo
            );


            return of(
              router.createUrlTree([
                '/pages/not-403'
              ])
            );
          }
        }


        // =================================================
        // 8. PROTEGER INTEGRIDAD NIVEL 2
        // ROL 2 O ADMINISTRADOR
        // =================================================

        if (
          url === '/pages/integridad' ||
          url.startsWith('/pages/integridad/')
        ) {
          if (
            !esIntegridadNivel2 &&
            !esAdministrador
          ) {
            console.warn(
              'ACCESO INTEGRIDAD NIVEL 2 DENEGADO PARA ROL:',
              rolActivo
            );

            return of(
              router.createUrlTree([
                '/pages/not-403'
              ])
            );
          }
        }


        // =================================================
        // 8.1 PROTEGER INTEGRIDAD NIVEL 3
        // ROL 4 O ADMINISTRADOR
        // =================================================

        if (
          url === '/pages/integridad3' ||
          url.startsWith('/pages/integridad3/')
        ) {
          if (
            !esIntegridadNivel3 &&
            !esAdministrador
          ) {
            console.warn(
              'ACCESO INTEGRIDAD NIVEL 3 DENEGADO PARA ROL:',
              rolActivo
            );

            return of(
              router.createUrlTree([
                '/pages/not-403'
              ])
            );
          }
        }


        // =================================================
        // 8.2 PROTEGER INTEGRIDAD NIVEL 4
        // ROL 6 O ADMINISTRADOR
        // =================================================

        if (
          url === '/pages/integridad4' ||
          url.startsWith('/pages/integridad4/')
        ) {
          if (
            !esIntegridadNivel4 &&
            !esAdministrador
          ) {
            console.warn(
              'ACCESO INTEGRIDAD NIVEL 4 DENEGADO PARA ROL:',
              rolActivo
            );

            return of(
              router.createUrlTree([
                '/pages/not-403'
              ])
            );
          }
        }

        // =================================================
        // 9. OBTENER MENÚS DEL USUARIO
        // =================================================

        return menuService
          .getMenusByUser(username)
          .pipe(

            map((data: Menu[]) => {


              const menus =
                data || [];


              menuService
                .setMenuChange(
                  menus
                );


              // =============================================
              // URL REAL + URL EQUIVALENTE DE LA BD
              // =============================================
              //
              // Ejemplo:
              //
              // Frontend:
              // /pages/qrd2/registrar
              //
              // BD:
              // /pages/registrar
              //
              // =============================================

              const urlsValidas: string[] = [
                url
              ];


              // =================================================
              // QRD NIVEL 2
              // =================================================

              if (
                url === '/pages/qrd2/inicio'
              ) {

                urlsValidas.push(
                  '/pages/home'
                );
              }


              if (
                url === '/pages/qrd2/registrar'
              ) {

                urlsValidas.push(
                  '/pages/registrar'
                );
              }


              if (
                url === '/pages/qrd2/pendientes'
              ) {

                urlsValidas.push(
                  '/pages/pendientes'
                );
              }


              if (
                url === '/pages/qrd2/listado'
              ) {

                urlsValidas.push(
                  '/pages/listado-total'
                );
              }


              if (
                url === '/pages/qrd2/estadistica'
              ) {

                urlsValidas.push(
                  '/pages/estadistica'
                );
              }


              if (
                url === '/pages/qrd2/manual'
              ) {

                urlsValidas.push(
                  '/pages/manual'
                );
              }


              // =================================================
              // QRD NIVEL 3
              // =================================================

              if (
                url === '/pages/qrd3/inicio'
              ) {

                urlsValidas.push(
                  '/pages/home'
                );
              }


              if (
                url === '/pages/qrd3/registrar'
              ) {

                urlsValidas.push(
                  '/pages/registrar'
                );
              }


              if (
                url === '/pages/qrd3/pendientes'
              ) {

                urlsValidas.push(
                  '/pages/pendientes'
                );
              }


              if (
                url === '/pages/qrd3/listado'
              ) {

                urlsValidas.push(
                  '/pages/listado-total'
                );
              }


              if (
                url === '/pages/qrd3/estadistica'
              ) {

                urlsValidas.push(
                  '/pages/estadistica'
                );
              }


              if (
                url === '/pages/qrd3/manual'
              ) {

                urlsValidas.push(
                  '/pages/manual'
                );
              }


              // =================================================
              // QRD NIVEL 4
              // =================================================

              if (
                url === '/pages/qrd4/inicio'
              ) {

                urlsValidas.push(
                  '/pages/home'
                );
              }


              if (
                url === '/pages/qrd4/registrar'
              ) {

                urlsValidas.push(
                  '/pages/registrar'
                );
              }


              if (
                url === '/pages/qrd4/pendientes'
              ) {

                urlsValidas.push(
                  '/pages/pendientes'
                );
              }


              if (
                url === '/pages/qrd4/listado'
              ) {

                urlsValidas.push(
                  '/pages/listado-total'
                );
              }


              if (
                url === '/pages/qrd4/estadistica'
              ) {

                urlsValidas.push(
                  '/pages/estadistica'
                );
              }


              if (
                url === '/pages/qrd4/manual'
              ) {

                urlsValidas.push(
                  '/pages/manual'
                );
              }


              // =================================================
              // INTEGRIDAD NIVEL 2
              // =================================================

              if (
                url === '/pages/integridad/inicio'
              ) {
                urlsValidas.push(
                  '/pages/home'
                );
              }

              if (
                url === '/pages/integridad/registrar'
              ) {
                urlsValidas.push(
                  '/pages/registrar'
                );
              }

              if (
                url === '/pages/integridad/pendientes'
              ) {
                urlsValidas.push(
                  '/pages/pendientes'
                );
              }

              if (
                url === '/pages/integridad/listado'
              ) {
                urlsValidas.push(
                  '/pages/listado-total'
                );
              }

              if (
                url === '/pages/integridad/estadistica'
              ) {
                urlsValidas.push(
                  '/pages/estadistica'
                );
              }

              if (
                url === '/pages/integridad/manual'
              ) {
                urlsValidas.push(
                  '/pages/manual'
                );
              }


              // =================================================
              // INTEGRIDAD NIVEL 3
              // NO TIENE REGISTRAR
              // =================================================

              if (
                url === '/pages/integridad3/inicio'
              ) {
                urlsValidas.push(
                  '/pages/home'
                );
              }

              if (
                url === '/pages/integridad3/pendientes'
              ) {
                urlsValidas.push(
                  '/pages/pendientes'
                );
              }

              if (
                url === '/pages/integridad3/listado'
              ) {
                urlsValidas.push(
                  '/pages/listado-total'
                );
              }

              if (
                url === '/pages/integridad3/estadistica'
              ) {
                urlsValidas.push(
                  '/pages/estadistica'
                );
              }

              if (
                url === '/pages/integridad3/manual'
              ) {
                urlsValidas.push(
                  '/pages/manual'
                );
              }


              // =================================================
              // INTEGRIDAD NIVEL 4
              // NO TIENE REGISTRAR
              // =================================================

              if (
                url === '/pages/integridad4/inicio'
              ) {
                urlsValidas.push(
                  '/pages/home'
                );
              }

              if (
                url === '/pages/integridad4/pendientes'
              ) {
                urlsValidas.push(
                  '/pages/pendientes'
                );
              }

              if (
                url === '/pages/integridad4/listado'
              ) {
                urlsValidas.push(
                  '/pages/listado-total'
                );
              }

              if (
                url === '/pages/integridad4/estadistica'
              ) {
                urlsValidas.push(
                  '/pages/estadistica'
                );
              }

              if (
                url === '/pages/integridad4/manual'
              ) {
                urlsValidas.push(
                  '/pages/manual'
                );
              }


              // =================================================
              // DEBUG
              // =================================================

              console.log(
                'URLS VÁLIDAS GUARD:',
                urlsValidas
              );


              console.log(
                'MENÚS DEL USUARIO:',
                menus
              );


              // =================================================
              // 10. VERIFICAR PERMISO
              // =================================================

              const tienePermiso =
                menus.some(
                  (menu: Menu) => {


                    const menuUrl =
                      String(
                        menu.url || ''
                      )
                        .trim();


                    if (!menuUrl) {

                      return false;
                    }


                    return urlsValidas.some(
                      urlValida =>

                        urlValida === menuUrl

                        ||

                        urlValida.startsWith(
                          menuUrl + '/'
                        )
                    );

                  }
                );


              // =================================================
              // 11. TIENE PERMISO
              // =================================================

              if (tienePermiso) {

                return true;
              }


              // =================================================
              // 12. HOME GENERAL
              // =================================================

              if (
                url === '/pages/home'
              ) {

                return true;
              }


              // =================================================
              // 13. DENEGAR
              // =================================================

              console.warn(
                'SIN PERMISO PARA:',
                url
              );


              return router.createUrlTree([
                '/pages/not-403'
              ]);

            })

          );

      })

    );

};