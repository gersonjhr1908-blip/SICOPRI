# SICOPRI

Código fuente del backend Spring Boot y frontend Angular.

## Requisitos
- Java 17 y Maven (o el wrapper mvnw incluido).
- Node.js compatible con Angular 17 y npm.
- Oracle con el esquema de la aplicación instalado. La base de datos no está incluida en este repositorio.

## Backend local
Configure estas variables de entorno en la terminal que ejecutará el backend:
DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, LOCAL_LOGIN_USERNAME y LOCAL_LOGIN_PASSWORD.
DB_URL debe ser la URL JDBC de su Oracle local. JWT_SECRET debe ser una clave aleatoria segura compatible con el algoritmo de la aplicación.
RECAPTCHA_SECRET_KEY es necesaria solo si utiliza la integración reCAPTCHA.
No publique los valores de estas variables.

Desde sicopri_backend ejecute en PowerShell:
```powershell
.\mvnw.cmd spring-boot:run
```
La configuración incluida usa el perfil local, escucha en 127.0.0.1:8080 y tiene el contexto /backend-sistema.

## Frontend
Desde sicopri_frontend:
```powershell
npm ci
npm start
```
Compruebe que src/environments apunte a su backend local. Use la URL que muestre Angular al arrancar.

## Trabajo compartido
Antes de editar ejecute git pull. Para publicar sus cambios, revise git status, cree un commit y ejecute git push.
Las dependencias, compilados, PDF subidos, credenciales y exportaciones Oracle no deben incluirse en Git.
Esta copia conserva el código aportado; la publicación no sustituye las pruebas funcionales de la aplicación.