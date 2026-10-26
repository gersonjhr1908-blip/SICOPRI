export interface ServidorDesi {
  id?: string;
  tipo?: string;
  nombre?: string;
  ip?: string;
  dominio?: string;
  tipoSsoo?: string;
  ssoo?: string;
  ram?: string;
  ddTotal?: string;
  servApp?: string;
  descripcion?: string;
  urlConsole?: string;
  usuarioConsole?: string;
  passwordConsole?: string;
  res?: string;
  usuarioServ?: string;
  passwordServ?: string;
  observacion?: string;
  tienePasswordServ?: boolean;
  tienePasswordConsole?: boolean;
  tieneUsuarioServ?: boolean;
  fechaRegistro?: string;
  fechaActualizacion?: string;
  userSave?: string;
  userUpdate?: string;
  /** Conteo de sistemas asociados (listado /filter). */
  cantidadSistemas?: number;
  /** Información libre sobre el acceso al servidor (SSH, RDP, etc.). */
  acceso?: string;
  /**
   * true si la contraseña fue cambiada durante el ciclo actual.
   * Una tarea programada lo resetea a false el día 25 de cada mes.
   */
  changePassword?: boolean;
}

export interface PasswordRevelado {
  password: string;
  tipo: string;
  usuario?: string;
}

export interface ServidorDesiResumen {
  totalServidores: number;
  totalLinux: number;
  totalWindows: number;
  totalMv: number;
}

export interface ResponseApi<T = unknown> {
  message: string;
  data: T;
  code: string;
  fecha?: string;
  url?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
