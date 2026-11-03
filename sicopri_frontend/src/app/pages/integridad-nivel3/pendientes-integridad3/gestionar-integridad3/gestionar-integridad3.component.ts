import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';

import Swal from 'sweetalert2';

import { VerCasoIntegridadComponent } from '../../../integridad/registrar-integridad/ver-caso-integridad/ver-caso-integridad.component';

import { IntegridadService } from '../../../../services/integridad.service';

import { ExpedienteService } from '../../../../services/expediente.service';

import { UsersService } from '../../../../services/users.service';

@Component({
  selector: 'app-gestionar-integridad3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-integridad3.component.html',
  styleUrl: './gestionar-integridad3.component.css',
})
export class GestionarIntegridad3Component extends VerCasoIntegridadComponent {
  @Input() respuestaGuardada = false;
  @Input() informeEnvioGuardado = false;
  @Input() procesandoAccion = false;
  @Input() respuestaNivel4Guardada = false;
  @Input() consultaRespuestaBloqueada = false;

  @Output() darRespuesta = new EventEmitter<any>();
  @Output() informarEnvio = new EventEmitter<any>();
  @Output() enviarNivel4 = new EventEmitter<any>();
  @Output() enviarNivel2 = new EventEmitter<any>();
  @Output() devolverDocumento = new EventEmitter<any>();

  constructor(
    integridadService: IntegridadService,
    expedienteService: ExpedienteService,
    usersService: UsersService,
    sanitizer: DomSanitizer,
  ) {
    super(integridadService, expedienteService, usersService, sanitizer);
  }

  get destinoFinal(): number {
    return Number(this.detalle?.nivelDestino ?? this.denuncia?.nivelDestino);
  }

  get accionesBloqueadas(): boolean {
    return (
      this.soloLectura ||
      this.procesandoAccion ||
      this.consultaRespuestaBloqueada ||
      this.cargandoDetalle ||
      !!this.errorDetalle ||
      !this.detalle ||
      this.guardandoSeguimiento ||
      this.guardandoObservacion
    );
  }

  get respuestaNivel4Recibida(): boolean {
    const estado = Number(this.detalle?.idEstado ?? this.denuncia?.idEstado);

    return (
      this.destinoFinal === 4 && (this.respuestaNivel4Guardada || estado === 4)
    );
  }

  get puedeResponder(): boolean {
    return this.destinoFinal === 3;
  }

  get puedeInformarEnvio(): boolean {
    return this.destinoFinal === 4;
  }

  get puedeEnviarNivel4(): boolean {
    return (
      this.destinoFinal === 4 &&
      !this.respuestaNivel4Recibida &&
      this.informeEnvioGuardado
    );
  }

  get puedeEnviarNivel2(): boolean {
    return (
      (this.destinoFinal === 3 && this.respuestaGuardada) ||
      (this.destinoFinal === 4 && this.respuestaNivel4Guardada)
    );
  }

  get puedeDevolver(): boolean {
    if (this.destinoFinal === 4) {
      return !this.respuestaNivel4Recibida;
    }

    return this.destinoFinal === 3 && !this.respuestaGuardada;
  }

  solicitarRespuesta(): void {
    if (this.accionesBloqueadas || !this.puedeResponder) {
      return;
    }

    this.darRespuesta.emit(this.obtenerCaso());
  }

  solicitarInformeEnvio(): void {
    if (this.accionesBloqueadas || !this.puedeInformarEnvio) {
      return;
    }

    this.informarEnvio.emit(this.obtenerCaso());
  }

  solicitarEnvioNivel4(): void {
  if (
    this.accionesBloqueadas ||
    this.destinoFinal !== 4 ||
    this.respuestaNivel4Recibida
  ) {
    return;
  }

  if (!this.observacionLista()) {
    return;
  }

  this.enviarNivel4.emit(this.obtenerCaso());
}

  solicitarEnvioNivel2(): void {
    if (this.accionesBloqueadas || !this.puedeEnviarNivel2) {
      return;
    }

    if (!this.observacionLista()) {
      return;
    }

    this.enviarNivel2.emit(this.obtenerCaso());
  }

  solicitarDevolucion(): void {
    if (this.accionesBloqueadas || !this.puedeDevolver) {
      return;
    }

    if (!this.observacionActual.trim()) {
      this.advertir(
        'Indique el motivo de la devolución en Observación / Indicaciones.',
      );
      return;
    }

    if (!this.observacionLista()) {
      return;
    }

    this.devolverDocumento.emit(this.obtenerCaso());
  }

  override salir(): void {
    if (this.procesandoAccion) {
      return;
    }

    super.salir();
  }

  private observacionLista(): boolean {
    const guardada = String(this.detalle?.observacionActual ?? '');

    if (this.guardandoObservacion || this.observacionActual !== guardada) {
      this.guardarObservacion();

      this.advertir(
        'Espere a que la observación indique Guardado y vuelva a realizar la acción.',
      );

      return false;
    }

    return true;
  }

  private obtenerCaso(): any {
    return {
      ...this.denuncia,
      ...this.detalle,
      observacionActual: this.observacionActual,
    };
  }

  private advertir(texto: string): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Revise el caso',
      text: texto,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#145c43',
    });
  }
}
