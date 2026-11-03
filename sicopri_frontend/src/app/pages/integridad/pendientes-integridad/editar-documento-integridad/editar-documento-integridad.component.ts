import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

import {
  EditarIntegridadComponent
} from '../../registrar-integridad/editar-integridad/editar-integridad.component';

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
  selector: 'app-editar-documento-integridad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:
    '../../registrar-integridad/editar-integridad/editar-integridad.component.html',
  styleUrl:
    '../../registrar-integridad/editar-integridad/editar-integridad.component.css'
})
export class EditarDocumentoIntegridadComponent
  extends EditarIntegridadComponent {

  constructor(
    integridadService: IntegridadService,
    expedienteService: ExpedienteService,
    usersService: UsersService
  ) {
    super(
      integridadService,
      expedienteService,
      usersService
    );
  }
}