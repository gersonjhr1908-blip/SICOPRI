import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  EstadisticaCompartidaComponent
} from '../../estadistica-compartida/estadistica-compartida.component';

@Component({
  selector: 'app-estadistica-integridad',
  standalone: true,
  imports: [CommonModule, EstadisticaCompartidaComponent],
  templateUrl: './estadistica-integridad.component.html',
  styleUrl: './estadistica-integridad.component.css'
})
export class EstadisticaIntegridadComponent {}