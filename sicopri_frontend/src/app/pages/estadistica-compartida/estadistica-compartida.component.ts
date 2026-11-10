import { CommonModule } from '@angular/common';


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
import { UsersService } from '../../services/users.service';

type Nivel = 2 | 3 | 4;
type Modulo = 'qrd' | 'integridad';

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

interface RegistroEstadistica {
  idNucleo: string;
  idTipoExpediente: number;
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
  imports: [CommonModule],
  templateUrl: './estadistica-compartida.component.html',
  styleUrl: './estadistica-compartida.component.css',
})
export class EstadisticaCompartidaComponent implements OnChanges, OnDestroy {
  @Input() modulo: Modulo = 'qrd';
  @Input() nivel: Nivel = 2;
  @Input() nivelFijo = false;

  pestana: 'resumen' | 'dependencias' | 'presentados' = 'resumen';
  dependencias: Dependencia[] = [];
  resumenDependencias: ResumenDependencia[] = [];
  totalDependencias = this.crearResumen({
    idNucleo: '', nombre: 'Total', acronimo: 'TOTAL',
  });

  readonly tiposReporte = [
    { nombre: 'Reclamo', sigla: 'R', indice: 0 },
    { nombre: 'Queja', sigla: 'Q', indice: 1 },
    { nombre: 'Denuncia', sigla: 'D', indice: 2 },
    { nombre: 'Integridad', sigla: 'I', indice: 3 },
  ];

  get tiposReporteVisibles() {
    return this.tiposReporte.filter(tipo =>
      this.modulo === 'integridad' ? tipo.sigla === 'I' : tipo.sigla !== 'I',
    );
  }

  get maximoPresentados(): number {
    return Math.max(1, this.totalDependencias.total);
  }

  get barrasPresentados(): ResumenDependencia[] {
    return [...this.resumenDependencias, this.totalDependencias];
  }

  get alcance(): string {
    if (this.nivel === 2 && !this.nivelFijo) return 'Todos los expedientes del módulo';
    return 'Expedientes relacionados con los niveles ' + this.nivelesPermitidos.join(' y ');
  }
  cargando = false;
  datosCargados = false;

  error = '';


  total = 0;
  enAtencion = 0;

  fechaConsulta = '';

  barrasEstados: BarraEstadistica[] = [];
  barrasPlazos: BarraEstadistica[] = [];

  private registros: RegistroEstadistica[] = [];

  private readonly recarga$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private expedienteService: ExpedienteService,
    private usuarios: UsersService,
  ) {}

  ngOnChanges(): void {
    this.pestana = 'resumen';
    this.cargarDatos();
  }
  ngOnDestroy(): void {
    this.recarga$.next();
    this.recarga$.complete();

    this.destroy$.next();
    this.destroy$.complete();
  }

  get nombreModulo(): string {
    return this.modulo === 'qrd' ? 'RQD' : 'Integridad';
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


    this.registros = [];
    this.total = 0;
    this.enAtencion = 0;
    this.barrasEstados = [];
    this.barrasPlazos = [];
    this.agruparDependencias([]);

    this.expedienteService
      .listarExpedientes()
      .pipe(
        switchMap(data => forkJoin({
          expedientes: of(data),
          nucleos: this.usuarios.getNucleos(),
        })),
        switchMap(({ expedientes: data, nucleos }) => {
          this.dependencias = (nucleos ?? []).map(nucleo => ({
            idNucleo: String(nucleo.idNucleo).trim(),
            nombre: nucleo.nombre,
            acronimo: nucleo.acronimo?.trim() || 'Sin acrónimo (' + nucleo.idNucleo + ')',
          }));
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

          this.recalcular();
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

  recalcular(): void {
    if (!this.datosCargados || this.cargando) return;

    const filtrados = this.registros.filter(registro =>
      (this.nivel === 2 && !this.nivelFijo) ||
      registro.niveles.some(nivel => this.nivelesPermitidos.includes(nivel as Nivel)),
    );

    this.agruparDependencias(filtrados);
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
          idNucleo: String(expediente.idNucleo ?? '').trim(),
          idTipoExpediente: Number(expediente.idTipoExpediente),
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
  private crearResumen(dependencia: Dependencia): ResumenDependencia {
    return {
      dependencia, pendientes: 0, concluidos: 0, total: 0,
      procesoPorTipo: [0, 0, 0, 0], concluidosPorTipo: [0, 0, 0, 0],
    };
  }

  private agruparDependencias(casos: RegistroEstadistica[]): void {
    const grupos = new Map<string, ResumenDependencia>(
      this.dependencias.map(dependencia => [dependencia.idNucleo, this.crearResumen(dependencia)]),
    );
    this.totalDependencias = this.crearResumen({
      idNucleo: '', nombre: 'Total', acronimo: 'TOTAL',
    });

    for (const caso of casos) {
      if (![2, 3, 4, 5].includes(caso.estado)) continue;
      let fila = grupos.get(caso.idNucleo);
      if (!fila) {
        fila = this.crearResumen({
          idNucleo: caso.idNucleo,
          nombre: caso.idNucleo ? 'Núcleo no disponible en el catálogo' : 'Sin núcleo asignado',
          acronimo: caso.idNucleo ? 'Núcleo ' + caso.idNucleo : 'SIN NÚCLEO',
        });
        grupos.set(caso.idNucleo, fila);
      }
      const indices: Record<number, number> = { 3: 0, 2: 1, 1: 2 };
      const indice = this.modulo === 'integridad' ? 3 : indices[caso.idTipoExpediente];
      const concluido = caso.estado === 5;

      for (const resumen of [fila, this.totalDependencias]) {
        resumen.total++;
        if (concluido) {
          resumen.concluidos++;
          resumen.concluidosPorTipo[indice]++;
        } else {
          resumen.pendientes++;
          resumen.procesoPorTipo[indice]++;
        }
      }
    }
    this.resumenDependencias = [...grupos.values()];
  }}

