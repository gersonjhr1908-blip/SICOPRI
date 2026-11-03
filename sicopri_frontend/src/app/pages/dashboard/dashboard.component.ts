import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '../../../environments/environment.development';

import { MenuService } from '../../services/menu.service';

import {
  InicioCompartidoComponent
} from '../inicio-compartido/inicio-compartido.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [InicioCompartidoComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  constructor(
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem(
      environment.TOKEN_NAME
    );

    if (!token) {
      return;
    }

    try {
      const helper = new JwtHelperService();

      const decodedToken = helper.decodeToken(token);

      const username = decodedToken?.sub;

      if (
        typeof username !== 'string' ||
        !username.trim()
      ) {
        return;
      }

      this.menuService
        .getMenusByUser(username)
        .subscribe({
          next: (menus) => {
            this.menuService.setMenuChange(menus);
          },
          error: (error) => {
            console.error(
              'No se pudieron cargar los menús:',
              error
            );
          }
        });
    } catch (error) {
      console.error(
        'No se pudo leer la sesión:',
        error
      );
    }
  }
}