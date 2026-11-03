import { Component } from '@angular/core';

import {
  ManualCompartidoComponent
} from '../../manual-compartido/manual-compartido.component';

@Component({
  selector: 'app-manual-integridad',
  standalone: true,
  imports: [ManualCompartidoComponent],
  templateUrl: './manual-integridad.component.html',
  styleUrl: './manual-integridad.component.css'
})
export class ManualIntegridadComponent {}