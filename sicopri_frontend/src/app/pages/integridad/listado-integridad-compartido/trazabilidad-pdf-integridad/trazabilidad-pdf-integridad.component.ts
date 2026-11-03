import { CommonModule, formatDate } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

import { Subject, takeUntil } from 'rxjs';

import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

import {
  ExpedienteService
} from '../../../../services/expediente.service';

@Component({
  selector: 'app-trazabilidad-pdf-integridad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trazabilidad-pdf-integridad.component.html',
  styleUrl: './trazabilidad-pdf-integridad.component.css'
})
export class TrazabilidadPdfIntegridadComponent
  implements OnChanges, OnDestroy {

  @Input() expediente: any = null;

  @Output() cerrar = new EventEmitter<void>();

  cargando = false;
  error = '';

  pdfUrl: SafeResourceUrl | null = null;
  nombreArchivo = 'trazabilidad-integridad.pdf';
  cantidadMovimientos = 0;

  private archivoPdf: Blob | null = null;
  private objectUrl: string | null = null;

  private readonly cambioCaso$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private expedienteService: ExpedienteService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expediente']) {
      this.generar();
    }
  }

  ngOnDestroy(): void {
    this.cambioCaso$.next();
    this.cambioCaso$.complete();

    this.destroy$.next();
    this.destroy$.complete();

    this.liberarPdf();
  }

  generar(): void {
    this.cambioCaso$.next();
    this.liberarPdf();

    this.error = '';
    this.cantidadMovimientos = 0;

    const id = Number(this.expediente?.idExpediente);

    if (!Number.isInteger(id) || id <= 0) {
      this.cargando = false;
      this.error = 'No se encontró el expediente.';
      return;
    }

    this.cargando = true;

    this.expedienteService
      .listarMovimientos(id)
      .pipe(
        takeUntil(this.cambioCaso$),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: any[]) => {
          try {
            const movimientos = [...(data || [])].sort(
              (a: any, b: any) =>
                String(a.fechaMovimiento ?? '').localeCompare(
                  String(b.fechaMovimiento ?? '')
                ) ||
                Number(a.idMovimiento ?? 0) -
                Number(b.idMovimiento ?? 0)
            );

            this.cantidadMovimientos = movimientos.length;

            this.archivoPdf = this.crearPdf(movimientos);

            this.objectUrl = URL.createObjectURL(this.archivoPdf);

            this.pdfUrl = this.sanitizer
              .bypassSecurityTrustResourceUrl(this.objectUrl);

            this.cargando = false;
          } catch (error) {
            console.error('ERROR AL GENERAR TRAZPDF:', error);

            this.cargando = false;
            this.error = 'No se pudo generar el PDF.';
          }
        },
        error: (error: any) => {
          this.cargando = false;

          this.error =
            error?.error?.message ||
            'No se pudieron consultar los movimientos.';
        }
      });
  }

  descargar(): void {
    if (!this.archivoPdf || this.cargando) {
      return;
    }

    const url = URL.createObjectURL(this.archivoPdf);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = this.nombreArchivo;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  cerrarModal(): void {
    this.cambioCaso$.next();
    this.cerrar.emit();
  }

  private crearPdf(movimientos: any[]): Blob {
    const documento = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    documento.setProperties({
      title: `Trazabilidad ${this.texto(this.expediente?.cinv)}`,
      subject: 'Seguimiento de expediente de Integridad',
      creator: 'Sistema de Integridad'
    });

    const cinv = this.texto(this.expediente?.cinv);

    this.nombreArchivo =
      `Trazabilidad_${cinv.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    const ancho = documento.internal.pageSize.getWidth();
    const alto = documento.internal.pageSize.getHeight();
    const margen = 14;

    const fechaConsulta = this.fecha(new Date(), true);

    const opcionesGenerales = {
      theme: 'grid' as const,
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: [45, 62, 54] as [number, number, number],
        lineColor: [215, 226, 219] as [number, number, number],
        lineWidth: 0.2,
        overflow: 'linebreak' as const,
        valign: 'top' as const
      },
      margin: {
        top: 43,
        right: margen,
        bottom: 17,
        left: margen
      }
    };

    autoTable(documento, {
      ...opcionesGenerales,
      startY: 45,
      body: [
        [
          'CÓDIGO',
          cinv,
          'ESTADO',
          this.estado(this.expediente?.idEstado)
        ],
        [
          'FECHA DE REGISTRO',
          this.fecha(this.expediente?.fechaRegistro),
          'UBICACIÓN ACTUAL',
          this.nivel(this.expediente?.nivelActual)
        ],
        [
          'FECHA DEL ACTO',
          this.fecha(this.expediente?.fechaActoCorrupcion),
          'DESTINO FINAL',
          this.nivel(this.expediente?.nivelDestino)
        ]
      ],
      columnStyles: {
        0: {
          cellWidth: 43,
          fontStyle: 'bold',
          fillColor: [237, 245, 240]
        },
        1: { cellWidth: 91 },
        2: {
          cellWidth: 39,
          fontStyle: 'bold',
          fillColor: [237, 245, 240]
        },
        3: { cellWidth: 96 }
      }
    });

    let siguienteY = this.ultimaPosicion(documento) + 5;

    autoTable(documento, {
      ...opcionesGenerales,
      startY: siguienteY,
      body: [
        ['MOTIVO', this.motivo(this.expediente?.motivoDenuncia)],
        [
          'DETALLE',
          this.texto(
            this.expediente?.detalle ||
            this.expediente?.descripcion
          )
        ],
        ['DETALLE (OTROS)', this.texto(this.expediente?.detalleOtros)]
      ],
      columnStyles: {
        0: {
          cellWidth: 43,
          fontStyle: 'bold',
          fillColor: [237, 245, 240]
        },
        1: { cellWidth: 226 }
      }
    });

    siguienteY = this.ultimaPosicion(documento) + 12;

    if (siguienteY > alto - 45) {
      documento.addPage();
      siguienteY = 49;
    }

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(11);
    documento.setTextColor(20, 92, 67);

    documento.text(
      `RECORRIDO DEL EXPEDIENTE · ${movimientos.length} movimientos`,
      margen,
      siguienteY
    );

    autoTable(documento, {
      ...opcionesGenerales,
      startY: siguienteY + 5,
      head: [[
        'N°',
        'FECHA Y HORA',
        'ORIGEN',
        'DESTINO',
        'ACCIÓN',
        'RESPONSABLE',
        'OBSERVACIÓN'
      ]],
      body: movimientos.length
        ? movimientos.map((movimiento: any, index: number) => [
            index + 1,
            this.fecha(movimiento.fechaMovimiento, true),
            this.nivel(movimiento.nivelOrigen),
            this.nivel(movimiento.nivelDestino),
            this.accion(movimiento.accion),
            this.texto(movimiento.usuario),
            this.texto(movimiento.observacion)
          ])
        : [[
            {
              content: 'No hay movimientos registrados.',
              colSpan: 7
            }
          ]],
      headStyles: {
        fillColor: [20, 92, 67],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [246, 250, 247]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 31 },
        2: { cellWidth: 31 },
        3: { cellWidth: 31 },
        4: { cellWidth: 47 },
        5: { cellWidth: 38 },
        6: { cellWidth: 81 }
      },
      showHead: 'everyPage'
    });

    const totalPaginas = documento.getNumberOfPages();

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      documento.setPage(pagina);

      documento.setFillColor(20, 92, 67);
      documento.rect(0, 0, ancho, 34, 'F');

      documento.setFont('helvetica', 'bold');
      documento.setFontSize(16);
      documento.setTextColor(255, 255, 255);
      documento.text('TRAZABILIDAD DEL EXPEDIENTE', margen, 13);

      documento.setFontSize(11);
      documento.text(cinv, margen, 22);

      documento.setFont('helvetica', 'normal');
      documento.setFontSize(8);
      documento.text('SISTEMA DE INTEGRIDAD', margen, 29);

      documento.text(
        `Consulta: ${fechaConsulta}`,
        ancho - margen,
        22,
        { align: 'right' }
      );

      documento.setDrawColor(205, 220, 211);
      documento.line(margen, alto - 12, ancho - margen, alto - 12);

      documento.setFontSize(8);
      documento.setTextColor(95, 111, 102);

      documento.text(
        'Integridad · Historial de movimientos registrados',
        margen,
        alto - 7
      );

      documento.text(
        `Página ${pagina} de ${totalPaginas}`,
        ancho - margen,
        alto - 7,
        { align: 'right' }
      );
    }

    return documento.output('blob');
  }

  private ultimaPosicion(documento: jsPDF): number {
    const tabla = documento as jsPDF & {
      lastAutoTable?: { finalY: number };
    };

    return tabla.lastAutoTable?.finalY ?? 45;
  }

  private fecha(valor: any, conHora = false): string {
    if (!valor) {
      return '—';
    }

    try {
      return formatDate(
        valor,
        conHora ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy',
        'en-US'
      );
    } catch {
      return this.texto(valor);
    }
  }

  private nivel(valor: any): string {
    const nivel = Number(valor);

    return [2, 3, 4].includes(nivel)
      ? `Integridad Nivel ${nivel}`
      : '—';
  }

  private estado(valor: any): string {
    const estados: Record<number, string> = {
      1: 'REGISTRADO',
      2: 'ENVIADO',
      3: 'OBSERVADO',
      4: 'CONCLUIDO',
      5: 'ARCHIVADO'
    };

    return estados[Number(valor)] || 'SIN ESTADO';
  }

  private accion(valor: any): string {
    return this.texto(valor).replace(/_/g, ' ');
  }

  private motivo(valor: any): string {
    const motivos: Record<string, string> = {
      APROPIACION:
        'Apropiación o uso indebido de recursos, bienes o información del Estado.',
      FAVORECIMIENTO: 'Favorecimiento indebido.',
      VENTAJAS: 'Acceso a ventajas indebidas.',
      INFLUENCIAS: 'Invocación de influencias en el Estado.',
      CONFLICTO: 'Mantener intereses en conflicto.',
      OBSTRUCCION: 'Obstrucción al acceso a la información pública.',
      AUTORIDAD: 'Abuso de autoridad.',
      OTROS: 'Otros.'
    };

    return motivos[String(valor)] || this.texto(valor);
  }

  private texto(valor: any): string {
    const texto = String(valor ?? '').trim();
    return texto || '—';
  }

  private liberarPdf(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = null;
    this.pdfUrl = null;
    this.archivoPdf = null;
  }
}