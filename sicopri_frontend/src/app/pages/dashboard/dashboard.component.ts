import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment.development';
import { MenuService } from '../../services/menu.service';
import { UsersService } from '../../services/users.service';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MaterialModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  username = '';
  grado = '';
  nombreApellidos = '';
  cargandoPerfil = true;

  constructor(
    private menuService: MenuService,
    private userService: UsersService
  ) {}

  ngOnInit(): void {
    const helper = new JwtHelperService();
    const token = sessionStorage.getItem(environment.TOKEN_NAME);
    const decodedToken = helper.decodeToken(token);

    this.username = decodedToken.sub;
    this.menuService.getMenusByUser(this.username).subscribe(data => this.menuService.setMenuChange(data));
    this.cargarPerfilUsuario();
  }

  private cargarPerfilUsuario(): void {
    this.cargandoPerfil = true;
    this.userService.getByUsername(this.username).subscribe({
      next: user => {
        const fullname = user?.fullname?.trim();
        if (fullname) {
          this.aplicarPerfilDesdeFullname(fullname);
        } else {
          this.grado = '';
          this.nombreApellidos = this.username;
        }
        this.cargandoPerfil = false;
      },
      error: () => {
        this.grado = '';
        this.nombreApellidos = this.username;
        this.cargandoPerfil = false;
      }
    });
  }

  /** Ej: "SO3 T/COMP INFO MAMANI ALCA JOSUE HABACUB" → grado + nombre/apellidos */
  private aplicarPerfilDesdeFullname(fullname: string): void {
    const partes = fullname.split(/\s+/).filter(Boolean);
    if (partes.length >= 2) {
      this.grado = partes[0].toUpperCase();
      this.nombreApellidos = partes.slice(1).join(' ');
      return;
    }
    this.grado = '';
    this.nombreApellidos = fullname;
  }
}
