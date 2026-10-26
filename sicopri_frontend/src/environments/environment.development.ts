export const environment = {
  //desarrollo
  production:false,
    HOST: 'http://localhost:8080/backend-sistema',
  TOKEN_NAME: 'access_token',
  RETRY: 0,
  recaptcha: {
    siteKey: '6LdfMKYrAAAAAIrOiH1Febo1AvNz8NWGwi_1c1nK',

  },

  allowedDomains: ["localhost:8080"],
  disallowedRoutes: ["http://localhost:8080/backend-sistema/login/forget"]

};
