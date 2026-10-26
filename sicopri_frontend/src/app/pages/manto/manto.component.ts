import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../model/users';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../../services/users.service';
import { RolesMenuComponent } from './roles-menu/roles-menu.component';
import { MatDialog } from '@angular/material/dialog';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../model/menu';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment.development';
import Swal from 'sweetalert2';
import { RegisterComponent } from './register/register.component';
import { EditComponent } from './edit/edit.component';


@Component({
  selector: 'app-manto',
  standalone: true,
  imports: [ MaterialModule, RouterOutlet],
  templateUrl: './manto.component.html',
  styleUrl: './manto.component.css'
})
export class MantoComponent implements OnInit{

  dataSource: MatTableDataSource<User>;
  displayedColumns: string[] = [];
  private readonly columnasBase = ['cip', 'username', 'fullname', 'rol', 'edit', 'estado', 'cambiarEstado'];
  puedeEliminarUsuario = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  buscador: string="";
  allData: any[];
  menus: Menu[];
  username: string;
  loading: boolean;
  pdfData: Blob;
  totalElements: number = 0;
    totalElementsActive: number = 0;
  tamano:number=1000000000;



  constructor(
    public dialog: MatDialog,
    private menuService: MenuService,
    private _snackBar: MatSnackBar,
    private userService: UsersService,    ) { }


  ngOnInit(): void {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    const decodedToken = helper.decodeToken(token);

    this.username = decodedToken.sub;
    this.puedeEliminarUsuario = this.username?.trim().toUpperCase() === 'JOHMAMANIA';
    this.configurarColumnas();
    this.menuService.getMenusByUser(this.username).subscribe(data => this.menuService.setMenuChange(data));

    this.userService.listPageable(this.buscador,0,this.tamano).subscribe(data => {
      this.allData = data;
      this.totalElements = data.totalElements;


      this.createTable(data.content);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

    });


    this.userService.getUserChange().subscribe(data => {
      this.createTable(data);
    });

    this.userService.getMessageChange().subscribe(data => {
      this._snackBar.open(data, 'INFO', { duration: 2000, horizontalPosition: 'right', verticalPosition: 'top' })
    });
  }

  createTable(data: User[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
    const totalEstado1 = data.filter(item => item.estado === 1).length;
  this.totalElementsActive=totalEstado1;
  }

    //-----------------------------------------------
  applyFilter(e: any) {
    this.dataSource.filter= e.target.value.trim();
    this.dataSource.filter = '';
    this.dataSource.filter = e.target.value.trim();
  }

  showMore(e: any) {
    this.userService.listPageable(this.buscador,e.pageIndex, e.pageSize).subscribe(data => {
      this.totalElements = data.totalElements;
      this.createTable(data.content);
    });
  }

  openRegistrarModal(): void {
    const dialogRef = this.dialog.open(RegisterComponent, {
      width: '57%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.refreshTable();
    });
    dialogRef.componentInstance.cerrarDialogo.subscribe(() => {
      dialogRef.close();
      Swal.fire({
        title: "Usuario registrado con éxito!!",
        icon: "success"
      });
    });
  }

  openEditarModal(idUser: number, username: string): void {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '57%',
      data: { id: idUser, username: username }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.refreshTable();
    });
    dialogRef.componentInstance.cerrarDialogo.subscribe(() => {
      dialogRef.close();
      Swal.fire({
        title: "Usuario Actualizado!!",
        icon: "success"
      });
    });
  }

  openWelcomeMessage(id: string, username: string): void {

    const dialogRef = this.dialog.open(RolesMenuComponent, {
      data: {
        idUser: id,
        username: username
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.ngOnInit();
    });
    dialogRef.componentInstance.cerrarDialogo.subscribe(() => {
      dialogRef.close();
      Swal.fire({
        title: "Permisos Actualizados!",
        icon: "success"
      });
    });
  }

  openReporte(): void {
   

  }


  //activar o desactiva rusuario
  changeEstado( id: number) {
    Swal.fire({
      title: "Estado",
      text: "Estas seguro de cambiar estado",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, cambiar"
    }).then((result) => {
      if (result.isConfirmed) {

        this.userService.changeEstado(id).subscribe();
        Swal.fire({
          title: "Cambiado!",
          icon: "success"
        });
        this.ngOnInit();
      }
    });

  }
  usersreportPdf():void {
    this.loading = true;
    this.userService.usersreportPdf().subscribe(
      (response: Blob) => {
        this.pdfData = response;
        this.loading = false;
        this.openPdf();
      },
      error => {
        console.error('Error:', error);
      }
    )
  }
  openPdf() {
    const fileURL = URL.createObjectURL(this.pdfData);
    window.open(fileURL, '_blank');
  }


  eliminarUsuario(username: string) {
    Swal.fire({
      title: "Eliminar usuario",
      text: "¿Estás seguro de eliminar este usuario?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.eliminarUsuario(username).subscribe();

        Swal.fire({
          title: "¡Usuario eliminado!",
          icon: "success"
        });
        this.ngOnInit();
      }
    });
  }

  refreshTable(): void {
    this.userService.listPageable(this.buscador,0, 5).subscribe(data => {
      this.totalElements = data.totalElements;
      this.createTable(data.content);
    });
  }

  convertirAMayusculas() {
    if (this.buscador){
      this.buscador = this.buscador.toUpperCase();
    }
  }

  configurarColumnas(): void {
    this.displayedColumns = this.puedeEliminarUsuario
      ? [...this.columnasBase, 'eliminar']
      : [...this.columnasBase];
  }

  getNombreRol(user: User): string {
    if (!user?.roles) {
      return '-';
    }
    const roles = user.roles;
    if (Array.isArray(roles)) {
      return roles.length ? roles.map(r => r.name).join(', ') : '-';
    }
    return roles.name ?? '-';
  }
}
