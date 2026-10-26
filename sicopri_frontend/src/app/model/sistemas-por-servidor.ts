import { SistemaDesi } from './sistema-desi';

export interface SistemasPorServidor {
  idServidor: string;
  nombreServidor: string;
  frontends: SistemaDesi[];
  backends: SistemaDesi[];
  monolitos: SistemaDesi[];
}
