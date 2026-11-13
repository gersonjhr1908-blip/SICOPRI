-- Ejecutar en Oracle con el propietario de SIQRED_USER_DATA,
-- antes de desplegar el backend actualizado.
-- RENAME conserva las filas, índices y restricciones, incluidas las FK.
RENAME SIQRED_USER_DATA TO USUARIOS;
