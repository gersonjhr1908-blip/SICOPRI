import { Component } from '@angular/core';

import {
  InicioCompartidoComponent
} from '../../inicio-compartido/inicio-compartido.component';

@Component({
  selector: 'app-inicio-qrd',
  standalone: true,
  imports: [InicioCompartidoComponent],
  templateUrl: './inicio-qrd.component.html',
  styleUrl: './inicio-qrd.component.css'
})
export class InicioQrdComponent {}