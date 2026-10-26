import { Brigada } from "./brigada";
import { Nucleo } from "./nucleo";
import { Rol } from "./rol";
import { Unidad } from "./unidad";

export class User {
    idUser: any;
    username: string;
    cip: string;
    fullname: string;
    roles: Rol | Rol[];
    estado?:number;
}
