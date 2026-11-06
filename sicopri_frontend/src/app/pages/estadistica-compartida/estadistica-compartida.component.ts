import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component, Input, OnChanges, OnDestroy } from '@angular/core';

import {
  Subject,
  from,
  of,
  forkJoin,
  mergeMap,
  map,
  switchMap,
  takeUntil,
  toArray,
} from 'rxjs';

import { ExpedienteService } from '../../services/expediente.service';

type Nivel = 2 | 3 | 4;
type Modulo = 'qrd' | 'integridad';

interface RegistroEstadistica {
  id: number;
  estado: number;
  fechaRegistro: string;
  niveles: number[];
  fechaFin: string;
}

interface BarraEstadistica {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

@Component({
  selector: 'app-estadistica-compartida',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estadistica-compartida.component.html',
  styleUrl: './estadistica-compartida.component.css',
})
export class EstadisticaCompartidaComponent implements OnChanges, OnDestroy {
  @Input() modulo: Modulo = 'qrd';
  @Input() nivel: Nivel = 2;
  @Input() nivelFijo = false;

  nivelSeleccionado: Nivel = 2;

  desde = '';
  hasta = '';

  cargando = false;
  datosCargados = false;

  error = '';
  errorFiltros = '';

  total = 0;
  enAtencion = 0;

  fechaConsulta = '';

  barrasEstados: BarraEstadistica[] = [];
  barrasPlazos: BarraEstadistica[] = [];

  private registros: RegistroEstadistica[] = [];

  private readonly recarga$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(private expedienteService: ExpedienteService) {}

  ngOnChanges(): void {
    this.nivelSeleccionado = this.nivel;
    this.desde = '';
    this.hasta = '';

    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.recarga$.next();
    this.recarga$.complete();

    this.destroy$.next();
    this.destroy$.complete();
  }

  get nombreModulo(): string {
    return this.modulo === 'qrd' ? 'QRD' : 'Integridad';
  }

  get nivelesPermitidos(): Nivel[] {
    if (this.nivelFijo) {
      return [this.nivel];
    }

    const niveles: Nivel[] = [2, 3, 4];
    return niveles.filter((nivel) => nivel >= Number(this.nivel));
  }

  get totalTarjetas(): number {
    return this.barrasEstados.reduce((suma, barra) => suma + barra.cantidad, 0);
  }

  cargarDatos(): void {
    this.recarga$.next();

    this.cargando = true;
    this.datosCargados = false;
    this.error = '';
    this.errorFiltros = '';

    this.registros = [];
    this.total = 0;
    this.enAtencion = 0;
    this.barrasEstados = [];
    this.barrasPlazos = [];

    this.expedienteService
      .listarExpedientes()
      .pipe(
        switchMap((data: any[]) => {
          if (!Array.isArray(data)) {
            throw new Error(
              'La lista de expedientes tiene un formato inesperado.',
            );
          }

          const unicos = new Map<number, any>();

          for (const expediente of data) {
            const id = Number(expediente.idExpediente);

            if (
              Number.isInteger(id) &&
              id > 0 &&
              this.perteneceAlModulo(expediente)
            ) {
              unicos.set(id, expediente);
            }
          }

          const candidatos = [...unicos.values()];

          return from(candidatos).pipe(
            mergeMap((expediente) => this.consultarRegistro(expediente), 4),
            toArray(),
          );
        }),
        takeUntil(this.recarga$),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (registros) => {
          this.registros = registros;
          this.fechaConsulta = this.hoyPeru();

          this.cargando = false;
          this.datosCargados = true;

          this.aplicarFiltros();
        },
        error: (error: any) => {
          console.error('ERROR AL CARGAR ESTADÍSTICAS:', error);

          this.cargando = false;
          this.datosCargados = false;
          this.registros = [];

          this.error =
            'No se pudieron completar las consultas de expedientes, ' +
            'movimientos o seguimiento. Vuelve a intentarlo. ' +
            'No se muestran resultados parciales.';
        },
      });
  }

  aplicarFiltros(): void {
    this.errorFiltros = '';

    if (
      !this.nivelesPermitidos.includes(Number(this.nivelSeleccionado) as Nivel)
    ) {
      this.errorFiltros = 'Seleccione uno de los niveles disponibles.';
      return;
    }

    const desde = this.desde ? this.fechaValida(this.desde) : '';

    const hasta = this.hasta ? this.fechaValida(this.hasta) : '';

    if ((this.desde && !desde) || (this.hasta && !hasta)) {
      this.errorFiltros = 'Seleccione fechas válidas.';
      return;
    }

    if (desde && hasta && desde > hasta) {
      this.errorFiltros = 'La fecha Desde no puede ser posterior a Hasta.';
      return;
    }

    if (!this.datosCargados || this.cargando) {
      return;
    }

    const nivel = Number(this.nivelSeleccionado);

    const filtrados = this.registros.filter((registro) => {
      const correspondeNivel = registro.niveles.includes(nivel);

      const correspondeFecha =
        (!desde ||
          (!!registro.fechaRegistro && registro.fechaRegistro >= desde)) &&
        (!hasta ||
          (!!registro.fechaRegistro && registro.fechaRegistro <= hasta));

      return correspondeNivel && correspondeFecha;
    });

    this.total = filtrados.length;

    const estados = [
      {
        id: 1,
        nombre: 'Registrados',
        color: '#697586',
      },
      {
        id: 2,
        nombre: 'Enviados / pendientes',
        color: '#2864ad',
      },
      {
        id: 3,
        nombre: 'Observados',
        color: '#c66d1b',
      },
      {
        id: 4,
        nombre: 'Concluidos',
        color: '#258348',
      },
      {
        id: 5,
        nombre: 'Archivados',
        color: '#124e39',
      },
    ];

    this.barrasEstados = estados.map((estado) => {
      const cantidad = filtrados.filter(
        (registro) => registro.estado === estado.id,
      ).length;

      return this.crearBarra(estado.nombre, cantidad, this.total, estado.color);
    });

    const abiertos = filtrados.filter((registro) =>
      [1, 2, 3].includes(registro.estado),
    );

    this.enAtencion = abiertos.length;

    const hoy = this.hoyPeru();

    const fueraPlazo = abiertos.filter(
      (registro) => !!registro.fechaFin && registro.fechaFin < hoy,
    ).length;

    const plazoNormal = abiertos.filter(
      (registro) => !!registro.fechaFin && registro.fechaFin >= hoy,
    ).length;

    const sinSeguimiento = abiertos.filter(
      (registro) => !registro.fechaFin,
    ).length;

    this.barrasPlazos = [
      this.crearBarra('Fuera de plazo', fueraPlazo, this.enAtencion, '#bb2836'),
      this.crearBarra('Plazo normal', plazoNormal, this.enAtencion, '#a58905'),
      this.crearBarra(
        'Sin seguimiento válido',
        sinSeguimiento,
        this.enAtencion,
        '#697586',
      ),
    ];
  }

  limpiarFiltros(): void {
    this.desde = '';
    this.hasta = '';
    this.nivelSeleccionado = this.nivel;

    this.aplicarFiltros();
  }

  private perteneceAlModulo(expediente: any): boolean {
    const activo = String(expediente.activo ?? '')
      .trim()
      .toUpperCase();

    const categoria = String(expediente.categoria ?? '')
      .trim()
      .toUpperCase();

    if (
      activo !== 'S' ||
      ![1, 2, 3, 4, 5].includes(Number(expediente.idEstado))
    ) {
      return false;
    }

    if (this.modulo === 'integridad') {
      return categoria === 'INTEGRIDAD';
    }

    return (
      categoria !== 'INTEGRIDAD' &&
      [1, 2, 3].includes(Number(expediente.idTipoExpediente))
    );
  }

  private consultarRegistro(expediente: any) {
    const id = Number(expediente.idExpediente);

    const requiereSeguimiento = [1, 2, 3].includes(Number(expediente.idEstado));

    const seguimiento$ = requiereSeguimiento
      ? this.expedienteService.obtenerSeguimiento(id)
      : of(null);

    return forkJoin({
      movimientos: this.expedienteService.listarMovimientos(id),
      respuestaSeguimiento: seguimiento$,
    }).pipe(
      map(({ movimientos, respuestaSeguimiento }) => {
        if (!Array.isArray(movimientos)) {
          throw new Error(`Movimientos inválidos del expediente ${id}.`);
        }

        const niveles = new Set<number>();

        const agregarNivel = (valor: any): void => {
          const numero = Number(valor);

          if ([2, 3, 4].includes(numero)) {
            niveles.add(numero);
          }
        };

        agregarNivel(expediente.nivelActual);

        if (this.modulo === 'integridad') {
          // Integridad 2 registra todos los casos del módulo.
          niveles.add(2);
        } else {
          // Conserva el valor por defecto usado en tu QRD 2.
          agregarNivel(expediente.nivelCreacion ?? 2);
        }

        for (const movimiento of movimientos) {
          agregarNivel(movimiento.nivelOrigen);
          agregarNivel(movimiento.nivelDestino);
        }

        let fechaFin = '';

        if (requiereSeguimiento) {
          const seguimiento =
            respuestaSeguimiento?.seguimiento ?? respuestaSeguimiento;

          const inicio = this.fechaValida(seguimiento?.fechaInicio);

          const fin = this.fechaValida(seguimiento?.fechaFin);

          if (inicio && fin && fin >= inicio) {
            fechaFin = fin;
          }
        }

        return {
          id,
          estado: Number(expediente.idEstado),
          fechaRegistro: this.fechaValida(expediente.fechaRegistro),
          niveles: [...niveles],
          fechaFin,
        } satisfies RegistroEstadistica;
      }),
    );
  }

  private crearBarra(
    nombre: string,
    cantidad: number,
    base: number,
    color: string,
  ): BarraEstadistica {
    return {
      nombre,
      cantidad,
      porcentaje: base > 0 ? (cantidad / base) * 100 : 0,
      color,
    };
  }

  private fechaValida(valor: unknown): string {
    if (typeof valor !== 'string') {
      return '';
    }

    const fecha = valor.slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return '';
    }

    const prueba = new Date(`${fecha}T00:00:00Z`);

    if (
      !Number.isFinite(prueba.getTime()) ||
      prueba.toISOString().slice(0, 10) !== fecha
    ) {
      return '';
    }

    return fecha;
  }

  private hoyPeru(): string {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const obtener = (tipo: string): string =>
      partes.find((parte) => parte.type === tipo)?.value ?? '';

    return [obtener('year'), obtener('month'), obtener('day')].join('-');
  }
}
