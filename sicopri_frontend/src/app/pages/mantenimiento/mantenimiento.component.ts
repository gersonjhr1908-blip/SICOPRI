import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ExpedienteService } from '../../services/expediente.service';

interface Tipificacion {
  idTipificacion: number;
  idTipoExpediente: number;
  nombre: string;
}

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.css',
})
export class MantenimientoComponent {
  private readonly expedientes = inject(ExpedienteService);

  readonly categorias = [
    { id: 2, nombre: 'Queja' },
    { id: 3, nombre: 'Reclamo' },
    { id: 1, nombre: 'Denuncia' },
  ];

  abierto = false;
  categoria = 2;
  tipificaciones: Tipificacion[] = [];
  agregando = false;
  nombre = '';
  cargando = false;
  guardando = false;
  error = '';

  alternarCatalogo(): void {
    this.abierto = !this.abierto;
    if (this.abierto) void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    this.error = '';
    this.tipificaciones = [];
    try {
      this.tipificaciones = (await firstValueFrom(this.expedientes.getTipificaciones(this.categoria)))
        .map(fila => ({ ...fila, idTipoExpediente: this.categoria }));
    } catch {
      this.error = 'No se pudo cargar el catálogo.';
    } finally {
      this.cargando = false;
    }
  }

  async guardar(): Promise<void> {
    const nombre = this.nombre.trim();
    if (this.guardando || this.cargando || !nombre || nombre.length > 100) return;

    this.guardando = true;
    try {
      await firstValueFrom(this.expedientes.agregarTipificacion(this.categoria, nombre));
      await this.cargar();
      this.nombre = '';
      this.agregando = false;
      void Swal.fire('Tipificación agregada', '', 'success');
    } catch (error: any) {
      const mensaje = error?.status === 409
        ? 'Esa tipificación ya existe en una de las categorías seleccionadas.'
        : error?.error?.message || 'No se pudo guardar la tipificación.';
      void Swal.fire('No se pudo agregar', mensaje, 'error');
    } finally {
      this.guardando = false;
    }
  }
  nombreCategoria(id: number): string {
    return this.categorias.find(item => item.id === id)?.nombre ?? '';
  }
  async eliminar(tipificacion: Tipificacion): Promise<void> {
    if (this.guardando || this.cargando) return;
    this.guardando = true;
    try {
      const respuesta = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar tipificación?',
        text: tipificacion.nombre + ' · ' + this.nombreCategoria(tipificacion.idTipoExpediente),
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (!respuesta.isConfirmed) return;
      await firstValueFrom(this.expedientes.eliminarTipificacion(tipificacion.idTipificacion));
      await this.cargar();
      void Swal.fire('Tipificación retirada', '', 'success');
    } catch {
      void Swal.fire('No se pudo eliminar', 'Revise la respuesta del servidor.', 'error');
    } finally {
      this.guardando = false;
    }
  }
}



