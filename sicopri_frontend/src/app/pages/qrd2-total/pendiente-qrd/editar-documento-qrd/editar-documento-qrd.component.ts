import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { ExpedienteService } from '../../../../services/expediente.service';

import { UsersService } from '../../../../services/users.service';

@Component({
  selector: 'app-editar-documento-qrd',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-documento-qrd.component.html',
  styleUrl: './editar-documento-qrd.component.css',
})
export class EditarDocumentoQrdComponent implements OnInit {
  @Input()
  expediente: any = null;

  @Output()
  cerrar = new EventEmitter<void>();

  @Output()
  actualizado = new EventEmitter<any>();

  formulario: any = {
    idExpediente: null,
    idTipoExpediente: null,
    idTipoDocumento: null,
    otroTipoDocumento: '',
    nroDocumento: '',
    fechaDocumento: '',
    idTipificacion: null,
    idNucleo: null,
    idBrigada: null,
    idUnidad: null,
    idNucleoIg: null,
    idIg: null,
    nivelDestino: null,
    asunto: '',
    descripcion: '',
  };

  tiposExpediente: any[] = [];
  tiposDocumento: any[] = [];
  tipificaciones: any[] = [];

  nucleos: any[] = [];
  brigadas: any[] = [];
  unidades: any[] = [];

  nucleosIg: any[] = [];
  igs: any[] = [];

  archivosActuales: any[] = [];
  archivosNuevos: File[] = [];

  guardando = false;
  cargandoArchivos = false;
  eliminandoArchivo: number | null = null;

  error = '';

  private cargaCompleta = false;
  private consultasPendientes = 0;
  private versionTipo = 0;
  private versionNucleo = 0;
  private versionBrigada = 0;
  private versionUnidad = 0;

  mostrarDatosPersona = false;

  datosPersona: Record<string, string> = {
    nombres: '',
    apellidos: '',
    ruc: '',
    dni: '',
    telefono: '',
    domicilio: '',
    correo: '',
  };

  readonly camposPersona = [
    { clave: 'nombres', etiqueta: 'NOMBRES', tipo: 'text', maximo: 100 },
    { clave: 'apellidos', etiqueta: 'APELLIDOS', tipo: 'text', maximo: 150 },
    { clave: 'ruc', etiqueta: 'RUC', tipo: 'text', maximo: 11 },
    { clave: 'dni', etiqueta: 'DNI', tipo: 'text', maximo: 8 },
    { clave: 'telefono', etiqueta: 'TELÉFONO', tipo: 'tel', maximo: 25 },
    { clave: 'domicilio', etiqueta: 'DOMICILIO', tipo: 'text', maximo: 250 },
    {
      clave: 'correo',
      etiqueta: 'CORREO ELECTRÓNICO',
      tipo: 'email',
      maximo: 254,
    },
  ];

  private cargarDatosPersona(): void {
    const persona = this.expediente?.datosPersona;

    this.datosPersona = {
      nombres: persona?.nombres ?? '',
      apellidos: persona?.apellidos ?? '',
      ruc: persona?.ruc ?? '',
      dni: persona?.dni ?? '',
      telefono: persona?.telefono ?? '',
      domicilio: persona?.domicilio ?? '',
      correo: persona?.correo ?? '',
    };

    this.mostrarDatosPersona = Object.values(this.datosPersona).some(
      (valor) => valor.trim() !== '',
    );
  }

  obtenerErrorPersona(clave: string): string {
    const valor = String(this.datosPersona[clave] ?? '').trim();

    if (!valor) {
      return '';
    }

    if (clave === 'ruc' && !/^\d{11}$/.test(valor)) {
      return 'Ingrese un RUC de 11 dígitos.';
    }

    if (clave === 'dni' && !/^\d{8}$/.test(valor)) {
      return 'Ingrese un DNI de 8 dígitos.';
    }

    if (clave === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      return 'Ingrese un correo válido.';
    }

    return '';
  }

  readonly personaSoloLectura = false;

  constructor(
    private expedienteService: ExpedienteService,
    private usersService: UsersService,
  ) {}

  ngOnInit(): void {
    void this.inicializarEdicion();
  }

  private numero(valor: any): number | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : null;
  }

  private textoId(valor: any): string | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    return String(valor);
  }

  private normalizarIds(datos: any[], claves: string[]): any[] {
    return (datos || []).map((item) => {
      const copia = { ...item };

      claves.forEach((clave) => {
        if (copia[clave] !== null && copia[clave] !== undefined) {
          copia[clave] = String(copia[clave]);
        }
      });

      return copia;
    });
  }

  private mensajeError(err: any, alternativa: string): string {
    const mensaje =
      err?.error?.message ||
      err?.error?.mensaje ||
      (typeof err?.error === 'string' ? err.error : '');

    return mensaje || alternativa;
  }

  private colocarAlertaEncima(popup: HTMLElement): void {
    if (popup.parentElement) {
      popup.parentElement.style.zIndex = '2000000';
    }
  }

  async inicializarEdicion(): Promise<void> {
    const idExpediente = Number(this.expediente?.idExpediente);

    if (!idExpediente) {
      this.error = 'No se recibió un expediente válido.';
      return;
    }

    this.guardando = true;
    this.cargandoArchivos = true;
    this.cargaCompleta = false;
    this.error = '';

    const exp = this.expediente;
    this.cargarDatosPersona();

    this.formulario = {
      idExpediente,
      idTipoExpediente: this.numero(exp.idTipoExpediente),
      idTipoDocumento: this.numero(exp.idTipoDocumento),
      otroTipoDocumento: exp.otroTipoDocumento || '',
      nroDocumento: exp.nroDocumento || '',
      fechaDocumento: String(exp.fechaDocumento || '').slice(0, 10),
      idTipificacion: this.numero(exp.idTipificacion),
      idNucleo: this.textoId(exp.idNucleo),
      idBrigada: this.textoId(exp.idBrigada),
      idUnidad: this.textoId(exp.idUnidad),
      idNucleoIg: this.textoId(exp.idNucleoIg),
      idIg: this.textoId(exp.idIg),
      nivelDestino: this.numero(exp.nivelDestino),
      asunto: exp.asunto || '',
      descripcion: exp.descripcion || '',
    };

    try {
      await Promise.all([
        this.cargarCatalogos(),
        this.cargarUbicacionesIniciales(),
        this.cargarArchivosActuales(),
      ]);

      this.cargaCompleta = true;
    } catch (err) {
      this.error = this.mensajeError(
        err,
        'No se pudieron cargar todos los datos. Cierre y vuelva a abrir el editor.',
      );
    } finally {
      this.guardando = false;
      this.cargandoArchivos = false;
    }
  }

  private async cargarCatalogos(): Promise<void> {
    const [tiposExpediente, tiposDocumento] = await Promise.all([
      firstValueFrom(this.expedienteService.getTiposExpediente()),
      firstValueFrom(this.expedienteService.getTiposDocumento()),
    ]);

    this.tiposExpediente = (tiposExpediente || [])
      .filter((tipo) => [1, 2, 3].includes(Number(tipo.idTipoExpediente)))
      .map((tipo) => ({
        ...tipo,
        idTipoExpediente: Number(tipo.idTipoExpediente),
      }));

    this.tiposDocumento = (tiposDocumento || []).map((tipo) => ({
      ...tipo,
      idTipoDocumento: Number(tipo.idTipoDocumento),
    }));

    if (this.formulario.idTipoExpediente !== null) {
      const datos = await firstValueFrom(
        this.expedienteService.getTipificaciones(
          this.formulario.idTipoExpediente,
        ),
      );

      this.tipificaciones = (datos || []).map((tip) => ({
        ...tip,
        idTipificacion: Number(tip.idTipificacion),
      }));
    }
  }

  private async cargarUbicacionesIniciales(): Promise<void> {
    const f = this.formulario;

    const [nucleos, brigadas, unidades, igs] = await Promise.all([
      firstValueFrom(this.usersService.getNucleos()),

      f.idNucleo
        ? firstValueFrom(this.usersService.getBrigadas(String(f.idNucleo)))
        : Promise.resolve([]),

      f.idNucleo && f.idBrigada
        ? firstValueFrom(
            this.usersService.getUnidades(
              String(f.idNucleo),
              String(f.idBrigada),
            ),
          )
        : Promise.resolve([]),

      f.idNucleoIg
        ? firstValueFrom(this.usersService.getBrigadas(String(f.idNucleoIg)))
        : Promise.resolve([]),
    ]);

    this.nucleos = this.normalizarIds(nucleos, ['idNucleo']);
    this.nucleosIg = [...this.nucleos];

    this.brigadas = this.normalizarIds(brigadas, ['idNucleo', 'idBrigada']);

    this.unidades = this.normalizarIds(unidades, [
      'idNucleo',
      'idBrigada',
      'idUnidad',
    ]);

    this.igs = this.normalizarIds(igs, ['idNucleo', 'idBrigada']);
  }

  private async cargarArchivosActuales(): Promise<void> {
    this.archivosActuales =
      (await firstValueFrom(
        this.expedienteService.listarArchivosExpediente(
          Number(this.expediente.idExpediente),
        ),
      )) || [];
  }

  async cambiarTipoExpediente(): Promise<void> {
    const version = ++this.versionTipo;

    this.formulario.idTipificacion = null;
    this.tipificaciones = [];

    if (!this.formulario.idTipoExpediente) {
      return;
    }

    this.consultasPendientes++;

    try {
      const datos = await firstValueFrom(
        this.expedienteService.getTipificaciones(
          Number(this.formulario.idTipoExpediente),
        ),
      );

      if (version !== this.versionTipo) {
        return;
      }

      this.tipificaciones = (datos || []).map((tip) => ({
        ...tip,
        idTipificacion: Number(tip.idTipificacion),
      }));
    } catch (err) {
      if (version === this.versionTipo) {
        this.error = this.mensajeError(
          err,
          'No se pudieron cargar las tipificaciones.',
        );
      }
    } finally {
      this.consultasPendientes--;
    }
  }

  esTipoDocumentoOtros(): boolean {
    const tipo = this.tiposDocumento.find(
      (item) =>
        Number(item.idTipoDocumento) ===
        Number(this.formulario.idTipoDocumento),
    );

    return (
      String(tipo?.nombre || '')
        .trim()
        .toUpperCase() === 'OTROS'
    );
  }

  cambiarTipoDocumento(): void {
    if (!this.esTipoDocumentoOtros()) {
      this.formulario.otroTipoDocumento = '';
    }
  }

  async cambiarNucleo(): Promise<void> {
    const version = ++this.versionNucleo;

    this.versionBrigada++;
    this.versionUnidad++;

    this.formulario.idBrigada = null;
    this.formulario.idUnidad = null;
    this.formulario.idNucleoIg = null;
    this.formulario.idIg = null;

    this.brigadas = [];
    this.unidades = [];
    this.igs = [];

    if (!this.formulario.idNucleo) {
      return;
    }

    this.consultasPendientes++;

    try {
      const datos = await firstValueFrom(
        this.usersService.getBrigadas(String(this.formulario.idNucleo)),
      );

      if (version === this.versionNucleo) {
        this.brigadas = this.normalizarIds(datos, ['idNucleo', 'idBrigada']);
      }
    } catch (err) {
      if (version === this.versionNucleo) {
        this.error = this.mensajeError(
          err,
          'No se pudieron cargar las grandes unidades.',
        );
      }
    } finally {
      this.consultasPendientes--;
    }
  }

  async cambiarBrigada(): Promise<void> {
    const version = ++this.versionBrigada;

    this.versionUnidad++;

    this.formulario.idUnidad = null;
    this.formulario.idNucleoIg = null;
    this.formulario.idIg = null;

    this.unidades = [];
    this.igs = [];

    if (!this.formulario.idNucleo || !this.formulario.idBrigada) {
      return;
    }

    this.consultasPendientes++;

    try {
      const datos = await firstValueFrom(
        this.usersService.getUnidades(
          String(this.formulario.idNucleo),
          String(this.formulario.idBrigada),
        ),
      );

      if (version === this.versionBrigada) {
        this.unidades = this.normalizarIds(datos, [
          'idNucleo',
          'idBrigada',
          'idUnidad',
        ]);
      }
    } catch (err) {
      if (version === this.versionBrigada) {
        this.error = this.mensajeError(
          err,
          'No se pudieron cargar las unidades.',
        );
      }
    } finally {
      this.consultasPendientes--;
    }
  }

  async cambiarUnidad(): Promise<void> {
    const version = ++this.versionUnidad;

    const unidad = this.unidades.find(
      (item) => String(item.idUnidad) === String(this.formulario.idUnidad),
    );

    this.formulario.idNucleoIg = null;
    this.formulario.idIg = null;
    this.igs = [];

    if (!unidad) {
      return;
    }

    const idNucleoIg = this.textoId(unidad.idNucleo);
    const idIg = this.textoId(unidad.idBrigada);

    this.formulario.idNucleoIg = idNucleoIg;

    if (!idNucleoIg) {
      return;
    }

    this.consultasPendientes++;

    try {
      const datos = await firstValueFrom(
        this.usersService.getBrigadas(idNucleoIg),
      );

      if (version === this.versionUnidad) {
        this.igs = this.normalizarIds(datos, ['idNucleo', 'idBrigada']);

        this.formulario.idIg = idIg;
      }
    } catch (err) {
      if (version === this.versionUnidad) {
        this.error = this.mensajeError(
          err,
          'No se pudo cargar la inspectoría.',
        );
      }
    } finally {
      this.consultasPendientes--;
    }
  }

  obtenerNombreNucleoIg(nucleo: any): string {
    const nombre = String(nucleo?.nombre || '').trim();

    const unidad = this.unidades.find(
      (item) => String(item.idUnidad) === String(this.formulario.idUnidad),
    );

    if (
      unidad?.guarnicion &&
      String(unidad.idNucleo) === String(nucleo.idNucleo)
    ) {
      return `${nombre} - ${String(unidad.guarnicion).trim()}`;
    }

    return nombre;
  }

  seleccionarArchivos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const seleccionados = Array.from(input.files || []);

    input.value = '';

    if (this.guardando || this.eliminandoArchivo !== null) {
      return;
    }

    const total =
      this.archivosActuales.length +
      this.archivosNuevos.length +
      seleccionados.length;

    if (total > 5) {
      this.error = 'Solo se permiten 5 PDF en total, incluidos los actuales.';
      return;
    }

    if (
      seleccionados.some(
        (archivo) =>
          !archivo.name.toLowerCase().endsWith('.pdf') ||
          (archivo.type !== '' && archivo.type !== 'application/pdf'),
      )
    ) {
      this.error = 'Solo se permiten archivos PDF.';
      return;
    }

    if (seleccionados.some((archivo) => archivo.size > 10 * 1024 * 1024)) {
      this.error = 'Cada PDF debe pesar como máximo 10 MB.';
      return;
    }

    this.error = '';
    this.archivosNuevos = [...this.archivosNuevos, ...seleccionados];
  }

  quitarArchivoNuevo(indice: number): void {
    if (this.guardando) {
      return;
    }

    this.archivosNuevos = this.archivosNuevos.filter((_, i) => i !== indice);
  }

  formatearTamano(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async eliminarPdf(archivo: any): Promise<void> {
    const idArchivo = Number(archivo?.idArchivo);

    if (
      !idArchivo ||
      this.guardando ||
      this.eliminandoArchivo !== null ||
      !this.cargaCompleta
    ) {
      return;
    }

    this.eliminandoArchivo = idArchivo;

    try {
      const respuesta = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar este PDF?',
        text: 'Se quitará inmediatamente del expediente. Cancelar el editor después no deshará esta acción.',
        showCancelButton: true,
        confirmButtonText: 'SÍ, ELIMINAR',
        cancelButtonText: 'CANCELAR',
        confirmButtonColor: '#b42318',
        didOpen: (popup) => this.colocarAlertaEncima(popup),
      });

      if (!respuesta.isConfirmed) {
        return;
      }

      await firstValueFrom(
        this.expedienteService.eliminarArchivoExpediente(idArchivo),
      );

      this.archivosActuales = this.archivosActuales.filter(
        (item) => Number(item.idArchivo) !== idArchivo,
      );

      this.error = '';
    } catch (err) {
      this.error = this.mensajeError(err, 'No se pudo eliminar el PDF.');
    } finally {
      this.eliminandoArchivo = null;
    }
  }

  private validarFormulario(): boolean {
    const f = this.formulario;

    if (!this.cargaCompleta) {
      this.error =
        'La carga inicial no terminó correctamente. Cierre y vuelva a abrir.';
      return false;
    }

    if (this.consultasPendientes > 0) {
      this.error = 'Espere a que terminen de cargar los desplegables.';
      return false;
    }

    const errorPersona =
      this.obtenerErrorPersona('ruc') ||
      this.obtenerErrorPersona('dni') ||
      this.obtenerErrorPersona('correo');

    if (errorPersona) {
      this.mostrarDatosPersona = true;
      this.error = errorPersona;
      return false;
    }

    if (
      Number(this.expediente?.idEstado) !== 3 ||
      Number(this.expediente?.nivelActual) !== 2
    ) {
      this.error =
        'Esta edición corresponde a expedientes observados ubicados en QRD2.';
      return false;
    }

    if (!f.idTipoExpediente || !f.idTipoDocumento) {
      this.error = 'Seleccione la categoría y el tipo de documento.';
      return false;
    }

    if (
      this.esTipoDocumentoOtros() &&
      !String(f.otroTipoDocumento || '').trim()
    ) {
      this.error = 'Especifique el tipo de documento.';
      return false;
    }

    if (!String(f.nroDocumento || '').trim() || !f.fechaDocumento) {
      this.error = 'Complete el número y la fecha del documento.';
      return false;
    }

    if (!f.idTipificacion) {
      this.error = 'Seleccione la tipificación.';
      return false;
    }

    if (!f.idNucleo || !f.idBrigada || !f.idUnidad) {
      this.error = 'Seleccione núcleo, gran unidad y unidad.';
      return false;
    }

    if (!f.idNucleoIg || !f.idIg) {
      this.error = 'Falta completar la inspectoría asociada a la unidad.';
      return false;
    }

    if (!String(f.asunto || '').trim() || !String(f.descripcion || '').trim()) {
      this.error = 'Complete el asunto y la descripción.';
      return false;
    }

    if (this.archivosActuales.length + this.archivosNuevos.length > 5) {
      this.error = 'Solo se permiten 5 PDF en total.';
      return false;
    }

    this.error = '';
    return true;
  }

  async guardarCambios(): Promise<void> {
    if (
      this.guardando ||
      this.eliminandoArchivo !== null ||
      !this.validarFormulario()
    ) {
      return;
    }

    this.guardando = true;

    let datosGuardados = false;

    try {
      const confirmacion = await Swal.fire({
        icon: 'question',
        title: '¿Guardar los cambios?',
        text: 'Se actualizará este expediente, conservando su CINV y su estado observado.',
        showCancelButton: true,
        confirmButtonText: 'SÍ, GUARDAR',
        cancelButtonText: 'CANCELAR',
        confirmButtonColor: '#176b49',
        didOpen: (popup) => this.colocarAlertaEncima(popup),
      });

      if (!confirmacion.isConfirmed) {
        return;
      }

      const f = this.formulario;
      const idExpediente = Number(this.expediente.idExpediente);

      const datos = {
        ...this.expediente,
        datosPersona: {
          nombres: this.datosPersona['nombres'].trim(),
          apellidos: this.datosPersona['apellidos'].trim(),
          ruc: this.datosPersona['ruc'].trim(),
          dni: this.datosPersona['dni'].trim(),
          telefono: this.datosPersona['telefono'].trim(),
          domicilio: this.datosPersona['domicilio'].trim(),
          correo: this.datosPersona['correo'].trim(),
        },
        idTipoExpediente: Number(f.idTipoExpediente),
        idTipoDocumento: Number(f.idTipoDocumento),
        idTipificacion: Number(f.idTipificacion),
        otroTipoDocumento: this.esTipoDocumentoOtros()
          ? String(f.otroTipoDocumento).trim()
          : null,
        nroDocumento: String(f.nroDocumento).trim(),
        fechaDocumento: f.fechaDocumento,
        idNucleo: String(f.idNucleo),
        idBrigada: String(f.idBrigada),
        idUnidad: String(f.idUnidad),
        idNucleoIg: Number(f.idNucleoIg),
        idIg: String(f.idIg),
        asunto: String(f.asunto).trim(),
        descripcion: String(f.descripcion).trim(),
        nivelDestino: this.expediente.nivelDestino,
        idEstado: this.expediente.idEstado,
        nivelActual: this.expediente.nivelActual,
        observacion: this.expediente.observacion,
      };

      const resultado = await firstValueFrom(
        this.expedienteService.actualizarExpediente(idExpediente, datos),
      );

      datosGuardados = true;

      while (this.archivosNuevos.length > 0) {
        const archivo = this.archivosNuevos[0];

        const guardados = await firstValueFrom(
          this.expedienteService.agregarArchivosExpediente(
            idExpediente,
            resultado?.cinv || this.expediente.cinv,
            [archivo],
          ),
        );

        this.archivosActuales = [
          ...this.archivosActuales,
          ...(guardados || []),
        ];

        this.archivosNuevos = this.archivosNuevos.slice(1);
      }

      this.actualizado.emit(resultado || datos);
    } catch (err) {
      const detalle = this.mensajeError(err, 'Ocurrió un error al guardar.');

      this.error = datosGuardados
        ? `Los datos se actualizaron, pero falta completar la carga de PDF. ${detalle}`
        : detalle;
    } finally {
      this.guardando = false;
    }
  }

  cerrarModal(): void {
    if (this.guardando || this.eliminandoArchivo !== null) {
      return;
    }

    this.cerrar.emit();
  }
}
