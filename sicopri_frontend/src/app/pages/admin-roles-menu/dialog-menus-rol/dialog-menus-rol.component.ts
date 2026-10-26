import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { NgFor, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { MenuAssign, RoleAdmin } from '../../../model/role-admin';
import { AdminRolesMenuService } from '../../../services/admin-roles-menu.service';

@Component({
  selector: 'app-dialog-menus-rol',
  standalone: true,
  imports: [MaterialModule, NgFor, NgIf],
  templateUrl: './dialog-menus-rol.component.html',
  styleUrl: './dialog-menus-rol.component.css'
})
export class DialogMenusRolComponent implements OnInit {

  menus: MenuAssign[] = [];
  guardando = false;
  cargando = true;

  constructor(
    private adminRolesService: AdminRolesMenuService,
    private dialogRef: MatDialogRef<DialogMenusRolComponent>,
    @Inject(MAT_DIALOG_DATA) public rol: RoleAdmin
  ) {}

  ngOnInit(): void {
    this.cargarMenus();
  }

  cargarMenus(): void {
    this.cargando = true;
    this.adminRolesService.listarMenusPorRol(this.rol.idRole).subscribe({
      next: data => {
        this.menus = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los menús', 'error');
      }
    });
  }

  toggleMenu(menu: MenuAssign): void {
    menu.assigned = !menu.assigned;
  }

  guardar(): void {
    const menuIds = this.menus.filter(m => m.assigned).map(m => m.idMenu);
    this.guardando = true;
    this.adminRolesService.actualizarMenusRol(this.rol.idRole, menuIds).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', 'Menús del rol actualizados', 'success');
        this.dialogRef.close(true);
      },
      error: () => {
        this.guardando = false;
        Swal.fire('Error', 'No se pudieron guardar los menús', 'error');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
