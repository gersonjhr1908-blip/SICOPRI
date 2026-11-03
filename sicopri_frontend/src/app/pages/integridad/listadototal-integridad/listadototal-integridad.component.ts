import { Component } from '@angular/core';

import {
  ListadoIntegridadCompartidoComponent
} from '../listado-integridad-compartido/listado-integridad-compartido.component';

@Component({
  selector: 'app-listadototal-integridad',
  standalone: true,
  imports: [ListadoIntegridadCompartidoComponent],
  template: `
    <app-listado-integridad-compartido [nivel]="2">
    </app-listado-integridad-compartido>
  `
})
export class ListadoTotalIntegridadComponent {}