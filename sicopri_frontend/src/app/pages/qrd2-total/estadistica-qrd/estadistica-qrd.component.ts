import { Component } from '@angular/core';

import {
  EstadisticaCompartidaComponent
} from '../../estadistica-compartida/estadistica-compartida.component';

@Component({
  selector: 'app-estadistica-qrd',
  standalone: true,
  imports: [EstadisticaCompartidaComponent],
  templateUrl: './estadistica-qrd.component.html',
  styleUrl: './estadistica-qrd.component.css'
})
export class EstadisticaQrdComponent {}