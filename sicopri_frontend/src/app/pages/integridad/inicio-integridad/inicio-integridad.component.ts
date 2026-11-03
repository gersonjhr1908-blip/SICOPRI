import { Component } from '@angular/core';

import {
  InicioCompartidoComponent
} from '../../inicio-compartido/inicio-compartido.component';

@Component({
  selector: 'app-inicio-integridad',
  standalone: true,
  imports: [InicioCompartidoComponent],
  templateUrl: './inicio-integridad.component.html',
  styleUrl: './inicio-integridad.component.css'
})
export class InicioIntegridadComponent {}