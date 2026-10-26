import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from '../environments/environment.development';
import { JwtModule } from '@auth0/angular-jwt';
import { ServerErrorsInterceptor } from './interceptor/server-errors.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import {  RECAPTCHA_V3_SITE_KEY  } from 'ng-recaptcha';


export function tokenGetter() {
  return sessionStorage.getItem(environment.TOKEN_NAME);
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),

    provideAnimationsAsync(),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,

      //para localhost

      //para generar war
           allowedDomains: environment.allowedDomains,
           disallowedRoutes: environment.disallowedRoutes

        },
      })
    ),
    provideHttpClient(withInterceptorsFromDi()), //para peticion HTTP -Forma cuando viaje el token jwt
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorsInterceptor,
      multi: true,

    },
    {
      provide: LocationStrategy, useClass: HashLocationStrategy
    },

    //recaptcha
    /*
   {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: environment.recaptcha.siteKey,
      } as RecaptchaSettings,
    },*/


    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptcha.siteKey,
    },

  ]

};
