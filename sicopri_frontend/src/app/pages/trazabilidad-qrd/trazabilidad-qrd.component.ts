import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ExpedienteService } from '../../services/expediente.service';

@Component({
  selector: 'app-trazabilidad-qrd',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trazabilidad-qrd.component.html',
  styleUrl: './trazabilidad-qrd.component.css',
})
export class TrazabilidadQrdComponent {
  @Input() expediente: any = null;
  @Input() modulo: 'QRD' | 'INTEGRIDAD' = 'QRD';

  @Output() cerrar = new EventEmitter<void>();

  inicioActivo = false;
  cargando = false;
  error = '';

  movimientos: any[] = [];

  constructor(private expedienteService: ExpedienteService) {}

  iniciarTrazabilidad(): void {
    const idExpediente = Number(this.expediente?.idExpediente);

    if (!idExpediente) {
      this.error = 'No se encontró el expediente.';
      return;
    }

    this.inicioActivo = true;
    this.cargando = true;
    this.error = '';

    this.expedienteService.listarMovimientos(idExpediente).subscribe({
      next: (data: any[]) => {
        this.movimientos = (data || []).map((movimiento: any) => ({
          ...movimiento,
          origenVisual: this.nivelVisual(movimiento.nivelOrigen),
          destinoVisual: this.nivelVisual(movimiento.nivelDestino),
          estadoVisual: this.estadoVisual(movimiento.accion),
        }));

        this.cargando = false;
      },

      error: (err) => {
        console.error('ERROR AL CARGAR TRAZABILIDAD:', err);

        this.movimientos = [];
        this.cargando = false;

        this.error =
          err?.error?.message || 'No se pudo cargar la trazabilidad.';
      },
    });
  }

  nivelVisual(nivel: any): string {
    const numero = Number(nivel);

    return [2, 3, 4].includes(numero) ? `${this.modulo} NIVEL ${numero}` : '-';
  }

  estadoVisual(accion: any): string {
    const texto = String(accion || '').toUpperCase();

    if (texto.includes('ARCHIV')) {
      return 'ARCHIVADO';
    }

    if (texto.includes('RESPUESTA') || texto.includes('CONCL')) {
      return 'CONCLUIDO';
    }

    if (texto.includes('OBSERV')) {
      return 'OBSERVADO';
    }

    if (texto.includes('ENVIA')) {
      return 'ENVIADO';
    }

    return 'REGISTRADO';
  }

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
