import { Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-manual',
  standalone: true,
  imports: [],
  templateUrl: './manual.component.html',
  styleUrl: './manual.component.css',
})
export class ManualComponent {
  readonly pdf = 'assets/manuales/manual-administrador.pdf';
  readonly visorPdf = inject(DomSanitizer).bypassSecurityTrustResourceUrl(this.pdf);
}