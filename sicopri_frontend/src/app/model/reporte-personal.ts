import { Archivo } from './Archivo';

export interface ReportePersonal {
  cip: string;
  nombres: string | null;
  solicitudes: Archivo[];
}
