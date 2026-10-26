import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { EMPTY, Observable, catchError, retry, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment.development";
import { Injectable } from "@angular/core";
import Swal from "sweetalert2";

@Injectable({
    providedIn: 'root'
})
export class ServerErrorsInterceptor implements HttpInterceptor{

    constructor(
        //private snackBar: MatSnackBar,
        private router: Router
    ){}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(req).pipe(retry(environment.RETRY))
            .pipe(tap(event => {
                if(event instanceof HttpResponse){
                    if (event.body && event.body.error === true && event.body.errorMessage) {
                        throw new Error(event.body.errorMessage);
                    }/*else{
                        this.snackBar.open('SUCCESS', 'INFO', { duration: 2000});
                    }*/
                }
            })).pipe(catchError( (err) => {
                if(err.status === 400){
                  Swal.fire({
                    title: 'ERROR ' + err.status,
                    text: err.error.message,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                 //   this.snackBar.open(err.message, 'ERROR 400', { duration: 5000 });
                }
                else if (err.status === 404){
                  Swal.fire({
                    title: 'ERROR ' + err.status,
                    text: err.error.message,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                   // this.snackBar.open('No existe el recurso', 'ERROR 404', { duration: 5000 });

                }
                else if (err.status === 403 ) {

                    Swal.fire({
                        title: 'ERROR ' + err.status,
                        text: err.error.message,
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                      this.router.navigate(['/login']);
                 //   this.snackBar.open(err.error.message, 'ERROR 403', { duration: 5000 });
                }else if  (err.status === 401) {

                  Swal.fire({
                      title: 'VALIDACION INCORRECTA ',
                      text: err.error.message,
                      icon: 'warning',
                      confirmButtonText: 'OK'
                  });
                    this.router.navigate(['/login']);
               //   this.snackBar.open(err.error.message, 'ERROR 403', { duration: 5000 });
              }
                else if (err.status === 500) {
                  Swal.fire({
                    title: 'ERROR ' + err.status,
                    text: err.error.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                   // this.snackBar.open(err.error.message, 'ERROR 500', { duration: 5000 });

                }
                else if (err.status === 409) {
                    return throwError(() => err);
                }
                else {
                  Swal.fire({
                    title: 'ERROR ' + err.status,
                    text: err.error.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                    //this.snackBar.open(err.error.message, 'ERROR', { duration: 5000 });
                }

                return EMPTY;
            }));

    }

    private showErrorAlert(message: string) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    }

}
