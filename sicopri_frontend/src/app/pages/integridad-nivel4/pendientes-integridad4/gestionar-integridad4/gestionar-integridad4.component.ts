import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import {
  VerCasoIntegridadComponent
} from '../../../integridad/registrar-integridad/ver-caso-integridad/ver-caso-integridad.component';

import { IntegridadService } from '../../../../services/integridad.service';
import { ExpedienteService } from '../../../../services/expediente.service';
import { UsersService } from '../../../../services/users.service';

@Component({
  selector: 'app-gestionar-integridad4',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-integridad4.component.html',
  styleUrl: './gestionar-integridad4.component.css'
})
export class GestionarIntegridad4Component
  extends VerCasoIntegridadComponent
  implements OnChanges, OnDestroy {

  @Input() respuestaGuardada = false;
  @Input() procesandoAccion = false;
  @Input() consultaRespuestaBloqueada = false;

  @Output() darRespuesta = new EventEmitter<any>();
  @Output() verRespuestas = new EventEmitter<any>();
  @Output() enviarNivel3 = new EventEmitter<any>();
  @Output() devolverDocumento = new EventEmitter<any>();

  mostrarInformes = false;
  informes: any[] = [];
  cargandoInformes = false;
  errorInformes = '';

  private readonly consultaInforme$ = new Subject<void>();
  private readonly finGestion4$ = new Subject<void>();

  constructor(
    private servicioIntegridad4: IntegridadService,
    expedienteService: ExpedienteService,
    usersService: UsersService,
    sanitizer: DomSanitizer
  ) {
    super(
      servicioIntegridad4,
      expedienteService,
      usersService,
      sanitizer
    );
  }

  override ngOnChanges(changes: SimpleChanges): void {
    if (changes['denuncia']) {
      this.consultaInforme$.next();
      this.mostrarInformes = false;
      this.informes = [];
      this.cargandoInformes = false;
      this.errorInformes = '';
    }

    super.ngOnChanges(changes);
  }

  override ngOnDestroy(): void {
    this.consultaInforme$.next();
    this.consultaInforme$.complete();

    this.finGestion4$.next();
    this.finGestion4$.complete();

    super.ngOnDestroy();
  }

  get casoEnNivel4(): boolean {
    return (
      Number(this.detalle?.nivelActual ?? this.denuncia?.nivelActual) === 4 &&
      Number(this.detalle?.nivelDestino ?? this.denuncia?.nivelDestino) === 4
    );
  }

  get accionesBloqueadas(): boolean {
    return (
      this.soloLectura ||
      !this.casoEnNivel4 ||
      this.procesandoAccion ||
      this.consultaRespuestaBloqueada ||
      this.cargandoDetalle ||
      !!this.errorDetalle ||
      !this.detalle ||
      this.guardandoSeguimiento ||
      this.guardandoObservacion
    );
  }

  get camposCaso(): any[] {
    return [
      {
        etiqueta: 'TIPO DE DOCUMENTO',
        valor: this.detalle?.tipoDocumento
      },
      {
        etiqueta: 'CÓDIGO DE DOCUMENTO',
        valor: this.detalle?.nroDocumento
      },
      {
        etiqueta: 'FECHA DEL ACTO DE CORRUPCIÓN',
        valor: this.detalle?.fechaActoCorrupcion,
        fecha: true
      },
      {
        etiqueta: 'MOTIVO DE LA DENUNCIA',
        valor: this.obtenerMotivoCompleto(this.detalle?.motivoDenuncia),
        completo: true
      },
      {
        etiqueta: 'MEDIDAS DE PROTECCIÓN',
        valor: this.obtenerProteccionCompleta(this.detalle?.medidaProteccion),
        completo: true
      },
      {
        etiqueta: 'FECHA DE REGISTRO',
        valor: this.detalle?.fechaRegistro,
        fecha: true
      },
      { etiqueta: 'NÚCLEO', valor: this.nombreNucleo },
      { etiqueta: 'GRAN UNIDAD', valor: this.nombreBrigada },
      { etiqueta: 'UNIDAD', valor: this.nombreUnidad },
      { etiqueta: 'NÚCLEO IG', valor: this.obtenerNombreNucleoIg() },
      { etiqueta: 'IG', valor: this.nombreIg },
      { etiqueta: 'DESTINO', valor: this.obtenerDestino() },
      {
        etiqueta: 'DETALLE',
        valor: this.detalle?.detalle,
        completo: true,
        texto: true
      },
      {
        etiqueta: 'DETALLE (OTROS)',
        valor: this.detalle?.detalleOtros,
        completo: true,
        texto: true
      }
    ];
  }

  solicitarRespuesta(verListado = false): void {
    if (this.accionesBloqueadas) {
      return;
    }

    if (verListado) {
      this.verRespuestas.emit(this.obtenerCaso4());
    } else {
      this.darRespuesta.emit(this.obtenerCaso4());
    }
  }

  solicitarEnvioNivel3(): void {
    if (
      this.accionesBloqueadas ||
      !this.respuestaGuardada ||
      !this.observacionLista4()
    ) {
      return;
    }

    this.enviarNivel3.emit(this.obtenerCaso4());
  }

  solicitarDevolucion(): void {
    if (this.accionesBloqueadas || this.respuestaGuardada) {
      return;
    }

    if (!this.observacionActual.trim()) {
      this.advertir4(
        'Indique el motivo de devolución en Observación / Indicaciones.'
      );
      return;
    }

    if (!this.observacionLista4()) {
      return;
    }

    this.devolverDocumento.emit(this.obtenerCaso4());
  }

  abrirInformes(): void {
    if (this.cargandoDetalle || !this.idExpediente) {
      return;
    }

    this.consultaInforme$.next();
    this.mostrarInformes = true;
    this.informes = [];
    this.cargandoInformes = true;
    this.errorInformes = '';

    this.servicioIntegridad4
      .listarInformesEnvio(this.idExpediente)
      .pipe(
        takeUntil(this.consultaInforme$),
        takeUntil(this.finGestion4$)
      )
      .subscribe({
        next: (data: any[]) => {
          this.informes = Array.isArray(data) ? data : [];
          this.cargandoInformes = false;
        },
        error: (error: any) => {
          this.cargandoInformes = false;
          this.errorInformes =
            error?.error?.message ||
            'No se pudieron consultar los informes de envío.';
        }
      });
  }

  cerrarInformes(): void {
    this.mostrarInformes = false;
    this.consultaInforme$.next();
    this.cargandoInformes = false;
  }

  verPdfInforme(informe: any): void {
    const id = Number(informe?.idInforme);

    if (!id) {
      return;
    }

    const ventana = window.open('about:blank', '_blank');

    if (!ventana) {
      this.advertir4(
        'Permita las ventanas emergentes para visualizar el PDF.'
      );
      return;
    }

    ventana.opener = null;
    let abierto = false;

    this.servicioIntegridad4
      .verPdfInformeEnvio(this.idExpediente, id)
      .pipe(
        takeUntil(this.consultaInforme$),
        takeUntil(this.finGestion4$)
      )
      .subscribe({
        next: (blob: Blob) => {
          if (ventana.closed) {
            return;
          }

          const url = URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' })
          );

          ventana.location.replace(url);
          abierto = true;

          setTimeout(() => URL.revokeObjectURL(url), 60000);
        },
        error: () => {
          ventana.close();

          void Swal.fire({
            icon: 'error',
            title: 'No se pudo abrir el informe',
            text: 'No se pudo consultar el PDF.'
          });
        },
        complete: () => {
          if (!abierto && !ventana.closed) {
            ventana.close();
          }
        }
      });
  }

  override salir(): void {
    if (this.procesandoAccion) {
      return;
    }

    super.salir();
  }

  private observacionLista4(): boolean {
    const guardada = String(this.detalle?.observacionActual ?? '');

    if (
      this.guardandoObservacion ||
      this.observacionActual !== guardada
    ) {
      this.guardarObservacion();

      this.advertir4(
        'Espere a que la observación indique Guardado y vuelva a realizar la acción.'
      );

      return false;
    }

    return true;
  }

  private obtenerCaso4(): any {
    return {
      ...this.denuncia,
      ...this.detalle,
      observacionActual: this.observacionActual
    };
  }

  private advertir4(text: string): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Revise el caso',
      text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#145c43'
    });
  }
}