import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RoleAdmin, RoleRequest } from '../../../model/role-admin';
import { AdminRolesMenuService } from '../../../services/admin-roles-menu.service';

export interface DialogFormRolData {
  rol?: RoleAdmin;
}

@Component({
  selector: 'app-dialog-form-rol',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './dialog-form-rol.component.html',
  styleUrl: './dialog-form-rol.component.css'
})
export class DialogFormRolComponent implements OnInit {

  titulo = 'Nuevo rol';
  esEdicion = false;
  guardando = false;

  modelo: RoleRequest = {
    name: '',
    description: ''
  };

  constructor(
    private adminRolesService: AdminRolesMenuService,
    private dialogRef: MatDialogRef<DialogFormRolComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogFormRolData
  ) {}

  ngOnInit(): void {
    if (this.data?.rol) {
      this.esEdicion = true;
      this.titulo = 'Editar rol';
      this.modelo = {
        name: this.data.rol.name,
        description: this.data.rol.description
      };
    }
  }

  guardar(): void {
    if (!this.modelo.name?.trim() || !this.modelo.description?.trim()) {
      Swal.fire('Atención', 'Complete nombre y descripción', 'warning');
      return;
    }

    this.guardando = true;
    const payload: RoleRequest = {
      name: this.modelo.name.trim(),
      description: this.modelo.description.trim()
    };

    const request$ = this.esEdicion
      ? this.adminRolesService.actualizarRol(this.data.rol!.idRole, payload)
      : this.adminRolesService.crearRol(payload);

    request$.subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire('Éxito', this.esEdicion ? 'Rol actualizado' : 'Rol creado', 'success');
        this.dialogRef.close(true);
      },
      error: () => {
        this.guardando = false;
        Swal.fire('Error', 'No se pudo guardar el rol', 'error');
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
