export const environment = {
production:true,
  HOST: 'https://sistema.ejercito.mil.pe/backend-sistema',
  TOKEN_NAME: 'access_token',
  RETRY: 0,
  //cambiar codigo de recaptcha
  recaptcha: {
     siteKey: '6LdfMKYrAAAAAIrOiH1Febo1AvNz8NWGwi_1c1nK',


  },

    allowedDomains: ["sistema.ejercito.mil.pe"],
    disallowedRoutes: ["https://sistema.ejercito.mil.pe/backend-sistema/login/forget"]
};
