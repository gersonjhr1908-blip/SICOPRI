import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  EstadisticaCompartidaComponent
} from '../../estadistica-compartida/estadistica-compartida.component';

@Component({
  selector: 'app-estadistica-integridad4',
  standalone: true,
  imports: [CommonModule, EstadisticaCompartidaComponent],
  templateUrl: './estadistica-integridad4.component.html',
  styleUrl: './estadistica-integridad4.component.css'
})
export class EstadisticaIntegridad4Component {}