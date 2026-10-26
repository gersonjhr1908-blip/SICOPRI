import { ServidorDesi } from './servidor-desi';

export interface SistemaDesi {
  id?: string;
  idServidor?: string;
  servidor?: ServidorDesi;
  acronimo?: string;
  nombre?: string;
  tipo?: string;
  categoria?: string;
  estado?: string;
  urlProduccion?: string;
  descripcion?: string;
  version?: string;
  idPadre?: string;
  dobleFactor?: boolean;
  imgFront?: string;
  dependenciaAdmin?: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}
