import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { Role, UsersService } from '../../../services/users.service';
import { NgFor, NgIf } from '@angular/common';
import { MaterialModule } from '../../../material/material.module';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-roles-menu',
  standalone: true,
  imports: [NgFor, MaterialModule, NgIf, FormsModule, RouterLink],
  templateUrl: './roles-menu.component.html',
  styleUrl: './roles-menu.component.css'
})
export class RolesMenuComponent {

  roles: Role[] = [];
  userRoles: Role[] = []; 
  username: string;

  @Output() cerrarDialogo = new EventEmitter<void>();
  
  constructor(
    private usuarioRoleService: UsersService, 
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {

    this.usuarioRoleService.getRoles().subscribe(roles => {
      this.roles = roles;
      this.getAndMarkUserRoles(this.data.idUser);
    });
  }

  getAndMarkUserRoles(userId: string): void {
    this.usuarioRoleService.getRolesForUser(userId).subscribe(userRoles => {
      this.userRoles = userRoles;
      this.roles.forEach(role => {
        role.checked = this.userRoles.some(userRole => userRole.idRole === role.idRole);
      });
    });
  }

  
  cambiarRoles(): void {

    const rolesIds: number[] = [];

    this.roles.forEach(role => {
      if (role.checked) {
        rolesIds.push(role.idRole); 
      }
    });

    this.usuarioRoleService.changeRoles(this.data.username, rolesIds).subscribe(

    );

    this.cerrarDialogo.emit();
  }

}