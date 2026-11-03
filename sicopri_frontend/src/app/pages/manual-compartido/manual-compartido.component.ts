import { CommonModule } from '@angular/common';

import {
  Component,
  Input,
  OnChanges
} from '@angular/core';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

@Component({
  selector: 'app-manual-compartido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manual-compartido.component.html',
  styleUrl: './manual-compartido.component.css'
})
export class ManualCompartidoComponent implements OnChanges {

  @Input() modulo: 'qrd' | 'integridad' = 'qrd';

  @Input() nivel: 2 | 3 | 4 = 2;

  pdfUrl: SafeResourceUrl | null = null;

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(): void {
    this.pdfUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.rutaPdf}#view=FitH`
      );
  }

  get nombreArchivo(): string {
    return `manual-${this.modulo}${this.nivel}.pdf`;
  }

  get rutaPdf(): string {
    return `assets/manuales/${this.nombreArchivo}`;
  }

  get titulo(): string {
    return this.modulo === 'qrd'
      ? `MANUAL DE USUARIO · QRD NIVEL ${this.nivel}`
      : `MANUAL DE USUARIO · INTEGRIDAD NIVEL ${this.nivel}`;
  }

  get departamento(): string {
    if (this.modulo === 'qrd') {
      return this.nivel === 2
        ? 'Departamento de Quejas, Reclamos y Denuncias'
        : 'Inspectoría de Quejas, Reclamos y Denuncias';
    }

    return this.nivel === 2
      ? 'Departamento de Denuncias Anticorruptivas'
      : 'Inspectoría de Integridad';
  }
}