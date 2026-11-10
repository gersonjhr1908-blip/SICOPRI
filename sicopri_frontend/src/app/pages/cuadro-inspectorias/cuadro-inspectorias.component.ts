import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, from, mergeMap, toArray } from 'rxjs';
import { ExpedienteService } from '../../services/expediente.service';
import { UsersService } from '../../services/users.service';
import { VerCasoComponent } from '../total-reg/ver-caso/ver-caso.component';

interface Columna {
  nombre: string;
  estado?: number;
  plazo?: 'normal' | 'vencido';
}
interface Dependencia {
  idNucleo: string;
  nombre: string;
  acronimo: string;
}

interface ResumenDependencia {
  dependencia: Dependencia;
  pendientes: number;
  concluidos: number;
  total: number;
  procesoPorTipo: number[];
  concluidosPorTipo: number[];
}

interface Fila {
  nombre: string;
  casos: any[][];
}

@Component({
  selector: 'app-cuadro-inspectorias',
  standalone: true,
  imports: [CommonModule, FormsModule, VerCasoComponent],
  templateUrl: './cuadro-inspectorias.component.html',
  styleUrl: './cuadro-inspectorias.component.css',
})
export class CuadroInspectoriasComponent implements OnInit {
  @Input({ required: true }) nivel!: 3 | 4;
  private readonly expedientes = inject(ExpedienteService);
  private readonly usuarios = inject(UsersService);

  readonly columnas: Columna[] = [
    { nombre: 'Registradas', estado: 1 },
    { nombre: 'Enviado', estado: 2 },
    { nombre: 'Observado', estado: 3 },
    { nombre: 'Plazo normal', plazo: 'normal' },
    { nombre: 'Fuera de plazo', plazo: 'vencido' },
    { nombre: 'Concluido', estado: 4 },
    { nombre: 'Archivado', estado: 5 },
  ];
  tipo = 'todos';
  categoriaQrd = 'todos';
  reporte: 'general' | 'dependencias' | 'presentados' = 'general';
  dependencias: Dependencia[] = [];
  resumenDependencias: ResumenDependencia[] = [];
  totalDependencias = this.crearResumen({ idNucleo: '', nombre: 'Total general', acronimo: 'TOTAL GENERAL' });
  readonly tiposReporte = [
    { nombre: 'Reclamo', sigla: 'R' },
    { nombre: 'Queja', sigla: 'Q' },
    { nombre: 'Denuncia', sigla: 'D' },
    { nombre: 'Integridad', sigla: 'I' },
  ];

  get esTotalPresentados(): boolean {
    return this.pestana === 'graficos' && this.reporte === 'presentados';
  }

  get categoriaQrdAplicada(): string {
    return this.esTotalPresentados ? 'todos' : this.categoriaQrd;
  }
  get tiposReporteVisibles() {
    return this.tiposReporte
      .map((tipo, indice) => ({ ...tipo, indice }))
      .filter(tipo => this.tipo === 'todos' ||
        (this.tipo === 'Integridad' ? tipo.nombre === 'Integridad' :
          tipo.nombre !== 'Integridad' && (this.categoriaQrdAplicada === 'todos' || tipo.nombre === this.categoriaQrdAplicada)));
  }

  get maximoPresentados(): number {
    return Math.max(1, ...this.resumenDependencias.map(fila => fila.total), this.totalDependencias.total);
  }

  get barrasPresentados(): ResumenDependencia[] {
    return [...this.resumenDependencias, this.totalDependencias];
  }
  pestana: 'cuadro' | 'graficos' = 'cuadro';

  get maximoGrafico(): number {
    return Math.max(1, ...this.totales);
  }
  registros: any[] = [];
  filas: Fila[] = [];
  totales: number[] = [];
  detalle: { titulo: string; casos: any[] } | null = null;
  caso: any = null;
  cargando = false;
  error = '';

  ngOnInit(): void {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    if (this.cargando) return;
    this.cargando = true;
    this.error = '';
    try {
      const [expedientes, catalogoNucleos] = await Promise.all([
        firstValueFrom(this.expedientes.listarExpedientes()),
        firstValueFrom(this.usuarios.getNucleos()),
      ]);
      this.dependencias = (catalogoNucleos ?? []).map(nucleo => ({
        idNucleo: String(nucleo.idNucleo).trim(),
        nombre: nucleo.nombre,
        acronimo: nucleo.acronimo?.trim() || 'Sin acrónimo (' + nucleo.idNucleo + ')',
      }));
      const activos = (expedientes ?? []).filter(exp => String(exp.activo).trim().toUpperCase() === 'S');
      const nucleos = [...new Set<string>(activos
        .filter(exp => exp.idNucleoIg && exp.idIg)
        .map(exp => String(exp.idNucleoIg)))];
      const catalogos = await firstValueFrom(from(nucleos).pipe(
        mergeMap(async nucleo => ({
          nucleo,
          brigadas: await firstValueFrom(this.usuarios.getBrigadas(nucleo)),
        }), 5),
        toArray(),
      ));
      const nombres = new Map<string, string>();
      for (const { nucleo, brigadas } of catalogos) {
        for (const brigada of brigadas ?? []) {
          nombres.set(nucleo + '/' + brigada.idBrigada, brigada.nombre);
        }
      }

      const registros = await firstValueFrom(from(activos).pipe(
        mergeMap(async exp => {
          const estado = Number(exp.idEstado);
          const directo = Number(exp.nivelActual) === this.nivel ||
            Number(exp.nivelCreacion) === this.nivel ||
            (estado === 1 && Number(exp.nivelDestino) === this.nivel);
          if (!directo) {
            const movimientos = await firstValueFrom(this.expedientes.listarMovimientos(exp.idExpediente));
            if (!(movimientos ?? []).some(mov =>
              Number(mov.nivelOrigen) === this.nivel || Number(mov.nivelDestino) === this.nivel
            )) return null;
          }
          let fechaFin = '';
          if ([1, 2, 3].includes(estado)) {
            const datos = await firstValueFrom(this.expedientes.obtenerSeguimiento(exp.idExpediente));
            const seguimiento = datos?.seguimiento ?? datos;
            const inicio = this.fechaValida(seguimiento?.fechaInicio);
            const fin = this.fechaValida(seguimiento?.fechaFin);
            if (inicio && fin >= inicio) fechaFin = fin;
          }
          const clave = exp.idNucleoIg && exp.idIg ? exp.idNucleoIg + '/' + exp.idIg : '';
          return {
            ...exp, estado, fechaFin, clave,
            inspectoría: clave ? nombres.get(clave) ?? 'Inspectoría ' + clave : 'Sin inspectoría asignada',
          };
        }, 6),
        toArray(),
      ));
      this.registros = registros.filter(registro => registro !== null);
      this.agrupar();
    } catch {
      this.registros = [];
      this.agrupar();
      this.error = 'No se pudo completar la consulta de expedientes e inspectorías.';
    } finally {
      this.cargando = false;
    }
  }

  private fechaValida(valor: unknown): string {
    const fecha = typeof valor === 'string' ? valor.slice(0, 10) : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return '';
    const prueba = new Date(fecha + 'T00:00:00Z');
    return Number.isFinite(prueba.getTime()) && prueba.toISOString().slice(0, 10) === fecha ? fecha : '';
  }

  tipoCaso(exp: any): string {
    if (String(exp.categoria ?? '').trim().toUpperCase() === 'INTEGRIDAD') return 'Integridad';
    const tipos: Record<number, string> = { 1: 'Denuncia', 2: 'Queja', 3: 'Reclamo' };
    return tipos[Number(exp.idTipoExpediente)] ?? 'QRD';
  }

  agrupar(): void {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const hoy = ['year', 'month', 'day'].map(tipo => partes.find(p => p.type === tipo)?.value).join('-');
    const grupos = new Map<string, Fila>();
    this.totales = this.columnas.map(() => 0);
    const filtrados: any[] = [];
    for (const caso of this.registros) {
      const tipoCaso = this.tipoCaso(caso);
      const coincideTipo = this.tipo === 'QRD'
        ? tipoCaso !== 'Integridad' && (this.categoriaQrdAplicada === 'todos' || tipoCaso === this.categoriaQrdAplicada)
        : tipoCaso === this.tipo;
      if (this.tipo !== 'todos' && !coincideTipo) continue;
      filtrados.push(caso);
      let fila = grupos.get(caso.clave);
      if (!fila) {
        fila = { nombre: caso.inspectoría, casos: this.columnas.map(() => []) };
        grupos.set(caso.clave, fila);
      }
      const filaActual = fila;
      this.columnas.forEach((col, indice) => {
        const coincide = col.plazo
          ? !!caso.fechaFin && (col.plazo === 'normal' ? caso.fechaFin >= hoy : caso.fechaFin < hoy)
          : caso.estado === col.estado;
        if (coincide) {
          filaActual.casos[indice].push(caso);
          this.totales[indice]++;
        }
      });
    }
    this.filas = [...grupos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    this.agruparDependencias(filtrados);
  }

  abrir(fila: Fila, indice: number): void {
    this.detalle = { titulo: fila.nombre + ' · ' + this.columnas[indice].nombre, casos: fila.casos[indice] };
  }
  private crearResumen(dependencia: Dependencia): ResumenDependencia {
    return {
      dependencia, pendientes: 0, concluidos: 0, total: 0,
      procesoPorTipo: [0, 0, 0, 0], concluidosPorTipo: [0, 0, 0, 0],
    };
  }

  private agruparDependencias(casos: any[]): void {
    const grupos = new Map<string, ResumenDependencia>(
      this.dependencias.map(dependencia => [dependencia.idNucleo, this.crearResumen(dependencia)]),
    );
    const vistos = new Set<number>();
    this.totalDependencias = this.crearResumen({
      idNucleo: '', nombre: 'Total general', acronimo: 'TOTAL GENERAL',
    });

    for (const caso of casos) {
      const id = Number(caso.idExpediente);
      if (vistos.has(id) || ![2, 3, 4, 5].includes(Number(caso.estado))) continue;
      vistos.add(id);

      const idNucleo = String(caso.idNucleo ?? '').trim();
      let fila = grupos.get(idNucleo);
      if (!fila) {
        const dependencia = {
          idNucleo,
          nombre: idNucleo ? 'Núcleo no disponible en el catálogo' : 'Sin núcleo asignado',
          acronimo: idNucleo ? 'Núcleo ' + idNucleo : 'SIN NÚCLEO',
        };
        fila = this.crearResumen(dependencia);
        grupos.set(idNucleo, fila);
      }
      const indiceTipo = this.tiposReporte.findIndex(tipo => tipo.nombre === this.tipoCaso(caso));
      const concluido = Number(caso.estado) === 5;
      for (const resumen of [fila, this.totalDependencias]) {
        resumen.total++;
        if (concluido) {
          resumen.concluidos++;
          if (indiceTipo >= 0) resumen.concluidosPorTipo[indiceTipo]++;
        } else {
          resumen.pendientes++;
          if (indiceTipo >= 0) resumen.procesoPorTipo[indiceTipo]++;
        }
      }
    }
    this.resumenDependencias = [...grupos.values()];
  }}






