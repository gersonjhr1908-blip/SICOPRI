export interface RoleAdmin {
  idRole: number;
  name: string;
  description: string;
  userCount: number;
}

export interface MenuAssign {
  idMenu: number;
  icon: string;
  name: string;
  url: string;
  assigned: boolean;
}

export interface RoleRequest {
  name: string;
  description: string;
}

export interface ResponseApi<T> {
  message: string;
  data: T;
  code: string;
}
