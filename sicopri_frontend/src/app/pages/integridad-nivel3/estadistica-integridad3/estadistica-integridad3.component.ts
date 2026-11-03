import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  EstadisticaCompartidaComponent
} from '../../estadistica-compartida/estadistica-compartida.component';

@Component({
  selector: 'app-estadistica-integridad3',
  standalone: true,
  imports: [CommonModule, EstadisticaCompartidaComponent],
  templateUrl: './estadistica-integridad3.component.html',
  styleUrl: './estadistica-integridad3.component.css'
})
export class EstadisticaIntegridad3Component {}