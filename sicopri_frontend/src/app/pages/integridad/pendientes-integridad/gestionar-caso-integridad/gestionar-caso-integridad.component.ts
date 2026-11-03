import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  VerCasoIntegridadComponent
} from '../../registrar-integridad/ver-caso-integridad/ver-caso-integridad.component';

import {
  IntegridadService
} from '../../../../services/integridad.service';

import {
  ExpedienteService
} from '../../../../services/expediente.service';

import {
  UsersService
} from '../../../../services/users.service';

@Component({
  selector: 'app-gestionar-caso-integridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:
    '../../registrar-integridad/ver-caso-integridad/ver-caso-integridad.component.html',
  styleUrl:
    '../../registrar-integridad/ver-caso-integridad/ver-caso-integridad.component.css'
})
export class GestionarCasoIntegridadComponent
  extends VerCasoIntegridadComponent {

  constructor(
    integridadService: IntegridadService,
    expedienteService: ExpedienteService,
    usersService: UsersService,
    sanitizer: DomSanitizer
  ) {
    super(
      integridadService,
      expedienteService,
      usersService,
      sanitizer
    );
  }
}