import { Component } from '@angular/core';

import {
  ListadoIntegridadCompartidoComponent
} from '../../integridad/listado-integridad-compartido/listado-integridad-compartido.component';

@Component({
  selector: 'app-listadototal-integridad4',
  standalone: true,
  imports: [ListadoIntegridadCompartidoComponent],
  template: `
    <app-listado-integridad-compartido [nivel]="4">
    </app-listado-integridad-compartido>
  `
})
export class ListadoTotalIntegridad4Component {}