import { FormsModule } from '@angular/forms';
import { firstValueFrom, of } from 'rxjs';
import Swal from 'sweetalert2';
import { ExpedienteService } from '../../../services/expediente.service';
import { UsersService } from '../../../services/users.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { VerCasoListadoQrdComponent } from '../../qrd2-total/listado-total/ver-caso-listado-qrd/ver-caso-listado-qrd.component';
import { VerCasoIntegridadComponent } from '../../integridad/registrar-integridad/ver-caso-integridad/ver-caso-integridad.component';

@Component({
  selector: 'app-ver-caso',
  standalone: true,
  imports: [CommonModule, FormsModule, VerCasoListadoQrdComponent, VerCasoIntegridadComponent],
  templateUrl: './ver-caso.component.html',
  styleUrl: './ver-caso.component.css',
})
export class VerCasoComponent implements OnInit {
  @Input() expediente: any = null;
  @Output() cerrar = new EventEmitter<void>();

  get esIntegridad(): boolean {
    return String(this.expediente?.categoria ?? '').trim().toUpperCase() === 'INTEGRIDAD';
  }
  @Input() editarInspectoria = false;
  @Output() inspectoriaGuardada = new EventEmitter<void>();

  readonly etiquetasInspectoria: Record<string, string> = {
    idNucleo: 'Núcleo', idBrigada: 'Brigada', idUnidad: 'Unidad',
    idNucleoIg: 'Núcleo IG', idIg: 'IG',
  };

  valores: Record<string, string> = {};
  opciones: Record<string, { id: string; nombre: string }[]> = {};
  cargando = false;
  guardando = false;
  error = '';

  constructor(private usuarios: UsersService, private expedientes: ExpedienteService) {}

  async ngOnInit(): Promise<void> {
    if (!this.editarInspectoria) return;
    for (const campo of ['idNucleo', 'idBrigada', 'idUnidad', 'idNucleoIg', 'idIg']) {
      this.valores[campo] = String(this.expediente?.[campo] ?? '');
    }
    await this.cargarOpciones();
  }

  async cambiar(campo: string, valor: string): Promise<void> {
    this.valores[campo] = valor;
    if (campo === 'idNucleo') this.valores['idBrigada'] = '';
    if (campo === 'idNucleo' || campo === 'idBrigada') this.valores['idUnidad'] = '';
    if (campo === 'idNucleoIg') this.valores['idIg'] = '';
    if (['idNucleo', 'idBrigada', 'idNucleoIg'].includes(campo)) await this.cargarOpciones();
  }

  async cargarOpciones(): Promise<void> {
    this.cargando = true;
    this.error = '';
    const { idNucleo, idBrigada, idNucleoIg } = this.valores;
    try {
      const [nucleos, brigadas, unidades, inspectores] = await Promise.all([
        firstValueFrom(this.usuarios.getNucleos()),
        firstValueFrom(idNucleo ? this.usuarios.getBrigadas(idNucleo) : of([])),
        firstValueFrom(idNucleo && idBrigada ? this.usuarios.getUnidades(idNucleo, idBrigada) : of([])),
        firstValueFrom(idNucleoIg ? this.usuarios.getBrigadas(idNucleoIg) : of([])),
      ]);
      const opciones = (filas: any[], clave: string) =>
        (filas ?? []).map(fila => ({ id: String(fila[clave]), nombre: String(fila.nombre ?? fila[clave]) }));
      this.opciones = {
        idNucleo: opciones(nucleos, 'idNucleo'),
        idBrigada: opciones(brigadas, 'idBrigada'),
        idUnidad: opciones(unidades, 'idUnidad'),
        idNucleoIg: opciones(nucleos, 'idNucleo'),
        idIg: opciones(inspectores, 'idBrigada'),
      };
    } catch {
      this.error = 'No se pudieron cargar los catálogos de inspectoría.';
    } finally {
      this.cargando = false;
    }
  }

  async guardarInspectoria(): Promise<void> {
    if (this.guardando || this.cargando || this.error) return;
    if (!Object.keys(this.opciones).every(campo =>
      this.opciones[campo].some(opcion => opcion.id === this.valores[campo])
    )) {
      await Swal.fire('Complete los cinco campos de inspectoría', '', 'warning');
      return;
    }
    const { idNucleo, idBrigada, idUnidad, idNucleoIg, idIg } = this.valores;
    this.guardando = true;
    try {
      await firstValueFrom(this.expedientes.cambiarInspectoriaComoAdministrador(
        Number(this.expediente.idExpediente),
        { idNucleo, idBrigada, idUnidad, idNucleoIg: Number(idNucleoIg), idIg },
      ));
      this.inspectoriaGuardada.emit();
      void Swal.fire('Inspectoría actualizada', '', 'success');
    } catch (error: any) {
      await Swal.fire('No se pudo guardar', error?.error?.message || 'Revise la respuesta del servidor.', 'error');
    } finally {
      this.guardando = false;
    }
  }
}


