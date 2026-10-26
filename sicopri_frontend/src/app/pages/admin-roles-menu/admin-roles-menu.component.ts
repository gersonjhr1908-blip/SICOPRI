import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment.development';
import { MenuService } from '../../services/menu.service';
import { AdminRolesMenuService } from '../../services/admin-roles-menu.service';
import { RoleAdmin } from '../../model/role-admin';
import { DialogMenusRolComponent } from './dialog-menus-rol/dialog-menus-rol.component';
import { DialogFormRolComponent } from './dialog-form-rol/dialog-form-rol.component';

@Component({
  selector: 'app-admin-roles-menu',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './admin-roles-menu.component.html',
  styleUrl: './admin-roles-menu.component.css'
})
export class AdminRolesMenuComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<RoleAdmin>([]);
  displayedColumns = ['name', 'description', 'menus', 'userCount', 'acciones'];
  buscador = '';
  username = '';
  cargando = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private menuService: MenuService,
    private adminRolesService: AdminRolesMenuService
  ) {}

  ngOnInit(): void {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    const decodedToken = helper.decodeToken(token);
    this.username = decodedToken.sub;
    this.menuService.getMenusByUser(this.username).subscribe(data => this.menuService.setMenuChange(data));
    this.cargarRoles();
    this.dataSource.filterPredicate = (data, filter) => {
      const term = filter.trim().toLowerCase();
      return (
        String(data.idRole).includes(term) ||
        (data.name || '').toLowerCase().includes(term) ||
        (data.description || '').toLowerCase().includes(term)
      );
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarRoles(): void {
    this.cargando = true;
    this.adminRolesService.listarRoles().subscribe({
      next: roles => {
        this.dataSource.data = roles;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    });
  }

  aplicarFiltro(): void {
    this.dataSource.filter = this.buscador.trim().toLowerCase();
  }

  get totalRoles(): number {
    return this.dataSource.filteredData?.length ?? 0;
  }

  openNuevoRol(): void {
    const ref = this.dialog.open(DialogFormRolComponent, {
      width: '420px',
      disableClose: true,
      data: {}
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.cargarRoles();
      }
    });
  }

  openEditarRol(rol: RoleAdmin): void {
    const ref = this.dialog.open(DialogFormRolComponent, {
      width: '420px',
      disableClose: true,
      data: { rol }
    });
    ref.afterClosed().subscribe(ok => {
      if (ok) {
        this.cargarRoles();
      }
    });
  }

  openMenusRol(rol: RoleAdmin): void {
    this.dialog.open(DialogMenusRolComponent, {
      width: '720px',
      maxHeight: '90vh',
      disableClose: true,
      data: rol
    });
  }

  eliminarRol(rol: RoleAdmin): void {
    const msg = rol.userCount > 0
      ? `El rol "${rol.name}" tiene ${rol.userCount} usuario(s). Se quitarán sus asignaciones. ¿Continuar?`
      : `¿Eliminar el rol "${rol.name}"?`;

    Swal.fire({
      title: 'Confirmar',
      text: msg,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.adminRolesService.eliminarRol(rol.idRole).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Rol eliminado correctamente', 'success');
            this.cargarRoles();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el rol', 'error')
        });
      }
    });
  }
}
