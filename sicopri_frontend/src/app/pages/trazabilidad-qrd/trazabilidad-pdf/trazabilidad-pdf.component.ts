import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ExpedienteService } from '../../../services/expediente.service';

@Component({
  selector: 'app-trazabilidad-pdf',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trazabilidad-pdf.component.html',
  styleUrl: './trazabilidad-pdf.component.css',
})
export class TrazabilidadPdfComponent implements OnChanges, OnDestroy {
  @Input() expediente: any = null;
  @Output() cerrar = new EventEmitter<void>();

  @ViewChild('reporte')
  reporte?: ElementRef<HTMLElement>;

  movimientos: any[] = [];
  cargando = false;
  error = '';
  errorImpresion = '';

  private consulta?: Subscription;

  readonly fechaConsulta = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());

  estadoExpediente(): string {
    switch (Number(this.expediente?.idEstado)) {
      case 1:
        return 'REGISTRADO';
      case 2:
        return 'EN ATENCIÓN';
      case 3:
        return 'OBSERVADO';
      case 4:
        return 'CONCLUIDO';
      case 5:
        return 'ARCHIVADO';
      default:
        return 'SIN ESTADO';
    }
  }

  categoriaExpediente(): string {
    if (this.expediente?.categoriaQrd) {
      return this.expediente.categoriaQrd;
    }

    switch (Number(this.expediente?.idTipoExpediente)) {
      case 1:
        return 'DENUNCIA';
      case 2:
        return 'QUEJA';
      case 3:
        return 'RECLAMO';
      default:
        return '—';
    }
  }

  tipoMovimiento(accion: any): string {
    const texto = String(accion ?? '').toUpperCase();

    if (texto.includes('ARCHIV')) {
      return 'archivo';
    }

    if (texto.includes('OBSERV') || texto.includes('DEVUEL')) {
      return 'observado';
    }

    if (texto.includes('RESPUESTA') || texto.includes('CONCL')) {
      return 'respuesta';
    }

    if (texto.includes('ENVIA') || texto.includes('DERIV')) {
      return 'envio';
    }

    return 'registro';
  }

  iconoMovimiento(accion: any): string {
    switch (this.tipoMovimiento(accion)) {
      case 'archivo':
        return '▣';
      case 'observado':
        return '!';
      case 'respuesta':
        return '✓';
      case 'envio':
        return '↗';
      default:
        return '▤';
    }
  }
  constructor(private expedienteService: ExpedienteService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expediente']) {
      this.cargarMovimientos();
    }
  }

  ngOnDestroy(): void {
    this.consulta?.unsubscribe();
  }

  cargarMovimientos(): void {
    this.consulta?.unsubscribe();

    this.movimientos = [];
    this.error = '';
    this.errorImpresion = '';

    const id = Number(this.expediente?.idExpediente);

    if (!id) {
      this.cargando = false;
      this.error = 'No se recibió un expediente válido.';
      return;
    }

    this.cargando = true;

    this.consulta = this.expedienteService.listarMovimientos(id).subscribe({
      next: (data: any[]) => {
        this.movimientos = [...(data || [])].sort(
          (a, b) =>
            String(a.fechaMovimiento ?? '').localeCompare(
              String(b.fechaMovimiento ?? ''),
            ) || Number(a.idMovimiento) - Number(b.idMovimiento),
        );

        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;

        this.error =
          err?.error?.message || 'No se pudo cargar la trazabilidad.';
      },
    });
  }

  nivel(valor: any): string {
    const numero = Number(valor);

    return [2, 3, 4].includes(numero) ? `QRD Nivel ${numero}` : '—';
  }

  fecha(valor: any): string {
    if (!valor) {
      return '—';
    }

    const texto = String(valor);

    const partes = texto.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/,
    );

    return partes
      ? `${partes[3]}/${partes[2]}/${partes[1]} ` +
          `${partes[4]}:${partes[5]}:${partes[6] || '00'}`
      : texto;
  }

  async imprimir(): Promise<void> {
    if (this.cargando || this.error || !this.reporte) {
      return;
    }

    this.errorImpresion = '';

    const ventana = window.open('', '_blank');

    if (!ventana) {
      this.errorImpresion =
        'Permita las ventanas emergentes para imprimir el reporte.';
      return;
    }

    ventana.opener = null;

    try {
      const doc = ventana.document;

      doc.title = `Trazabilidad ${this.expediente?.cinv || ''}`;

      // Copiar los estilos ya cargados por Angular.
      // El contenido del reporte se copia desde el DOM,
      // sin interpretar textos del expediente como HTML.
      document
        .querySelectorAll('style, link[rel="stylesheet"]')
        .forEach((nodo) => {
          const copia = nodo.cloneNode(true) as HTMLElement;

          if (nodo instanceof HTMLLinkElement) {
            copia.setAttribute('href', nodo.href);
          }

          doc.head.appendChild(copia);
        });

      const contenido = doc.importNode(this.reporte.nativeElement, true);

      doc.body.appendChild(contenido);

      // Esperar las hojas de estilo externas de la ventana.
      await Promise.all(
        Array.from(
          doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
        ).map((enlace) =>
          enlace.sheet
            ? Promise.resolve()
            : new Promise<void>((resolve, reject) => {
                enlace.onload = () => resolve();
                enlace.onerror = () =>
                  reject(new Error('No se pudieron cargar los estilos.'));
              }),
        ),
      );

      await doc.fonts.ready;

      await new Promise<void>((resolve) => {
        ventana.requestAnimationFrame(() => {
          ventana.requestAnimationFrame(() => resolve());
        });
      });

      if (!ventana.closed) {
        ventana.focus();
        ventana.print();
      }
    } catch {
      if (!ventana.closed) {
        ventana.close();
      }

      this.errorImpresion =
        'No se pudo preparar la impresión. Inténtelo nuevamente.';
    }
  }
}
