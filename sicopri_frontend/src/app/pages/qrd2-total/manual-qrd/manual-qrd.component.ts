import { Component } from '@angular/core';

import {
  ManualCompartidoComponent
} from '../../manual-compartido/manual-compartido.component';

@Component({
  selector: 'app-manual-qrd',
  standalone: true,
  imports: [ManualCompartidoComponent],
  templateUrl: './manual-qrd.component.html',
  styleUrl: './manual-qrd.component.css'
})
export class ManualQrdComponent {}